from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models import Subtask, Task, User
from app.schemas import Category, Priority, RescheduleIn, Status, SubtaskIn, SubtaskOut, TaskIn, TaskOut
from app.utils.deps import current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def out(t: Task, user: User) -> TaskOut:
    o = TaskOut.model_validate(t)
    o.effective_status = t.status
    if t.status in ("todo", "in_progress") and t.due_date:
        tz = ZoneInfo(user.timezone)
        local_now = datetime.now(tz)
        if t.due_time:
            due = datetime.combine(t.due_date, t.due_time, tzinfo=tz)
            if due < local_now:
                o.effective_status = "overdue"
        elif t.due_date < local_now.date():
            o.effective_status = "overdue"
    return o


def owned(db: Session, user: User, task_id: int) -> Task:
    t = db.scalar(select(Task).where(Task.id == task_id, Task.user_id == user.id).options(selectinload(Task.subtasks)))
    if not t:
        raise HTTPException(404, "Task not found.")
    return t


def apply_status(t: Task, status: str):
    t.status = status
    t.completed_at = datetime.now(timezone.utc) if status == "completed" else None


@router.get("", response_model=list[TaskOut])
def list_tasks(
    status: Status | None = None, category: Category | None = None, priority: Priority | None = None,
    q: str | None = Query(None, max_length=100), due_from: date | None = None, due_to: date | None = None,
    limit: int = Query(100, ge=1, le=200), offset: int = Query(0, ge=0),
    user: User = Depends(current_user), db: Session = Depends(get_db),
):
    stmt = select(Task).where(Task.user_id == user.id).options(selectinload(Task.subtasks))
    if status: stmt = stmt.where(Task.status == status)
    if category: stmt = stmt.where(Task.category == category)
    if priority: stmt = stmt.where(Task.priority == priority)
    if q: stmt = stmt.where(Task.title.ilike(f"%{q}%"))
    if due_from: stmt = stmt.where(Task.due_date >= due_from)
    if due_to: stmt = stmt.where(Task.due_date <= due_to)
    stmt = stmt.order_by(Task.due_date.is_(None), Task.due_date, Task.due_time, Task.id).limit(limit).offset(offset)
    return [out(t, user) for t in db.scalars(stmt)]


@router.post("", response_model=TaskOut, status_code=201)
def create_task(body: TaskIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = Task(user_id=user.id, **body.model_dump(exclude={"status"}))
    apply_status(t, body.status)
    db.add(t)
    db.commit()
    return out(owned(db, user, t.id), user)


@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    return out(owned(db, user, task_id), user)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, body: TaskIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = owned(db, user, task_id)
    for k, v in body.model_dump(exclude={"status"}).items():
        setattr(t, k, v)
    if body.status != t.status:
        apply_status(t, body.status)
    db.commit()
    return out(t, user)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.delete(owned(db, user, task_id))
    db.commit()


@router.patch("/{task_id}/complete", response_model=TaskOut)
def complete_task(task_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = owned(db, user, task_id)
    apply_status(t, "completed")
    db.commit()
    return out(t, user)


@router.patch("/{task_id}/reschedule", response_model=TaskOut)
def reschedule_task(task_id: int, body: RescheduleIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = owned(db, user, task_id)
    t.due_date, t.due_time = body.due_date, body.due_time
    db.commit()
    return out(t, user)


@router.post("/{task_id}/subtasks", response_model=SubtaskOut, status_code=201)
def add_subtask(task_id: int, body: SubtaskIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = owned(db, user, task_id)
    s = Subtask(task_id=t.id, title=body.title.strip())
    db.add(s)
    db.commit()
    return s


@router.patch("/{task_id}/subtasks/{sub_id}/toggle", response_model=SubtaskOut)
def toggle_subtask(task_id: int, sub_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = owned(db, user, task_id)
    s = next((x for x in t.subtasks if x.id == sub_id), None)
    if not s:
        raise HTTPException(404, "Subtask not found.")
    s.completed = not s.completed
    s.completed_at = datetime.now(timezone.utc) if s.completed else None
    db.commit()
    return s
