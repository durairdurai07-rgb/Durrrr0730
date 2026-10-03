from datetime import date, datetime, time
from typing import Literal
from zoneinfo import available_timezones
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

Category = Literal["homework", "assignment", "study", "project", "hackathon", "event", "exam", "test", "competition", "personal", "other"]
Priority = Literal["critical", "high", "medium", "low"]
Status = Literal["todo", "in_progress", "completed", "cancelled"]


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str
    timezone: str = "UTC"

    @model_validator(mode="after")
    def check(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        if self.timezone not in available_timezones():
            raise ValueError("Unknown timezone")
        return self


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str = Field(min_length=10, max_length=200)
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str

    @model_validator(mode="after")
    def same(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    timezone: str
    avatar_url: str | None = None


class SubtaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class SubtaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    completed: bool
    completed_at: datetime | None


class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: Category = "other"
    status: Status = "todo"
    priority: Priority = "medium"
    due_date: date | None = None
    due_time: time | None = None
    repeat_rule: str | None = Field(default=None, max_length=64)

    @field_validator("title")
    @classmethod
    def strip(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Title is required")
        return v

    @model_validator(mode="after")
    def time_needs_date(self):
        if self.due_time and not self.due_date:
            raise ValueError("A due time needs a due date")
        return self


class RescheduleIn(BaseModel):
    due_date: date
    due_time: time | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str | None
    category: str
    status: str
    effective_status: str = ""
    priority: str
    due_date: date | None
    due_time: time | None
    repeat_rule: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    subtasks: list[SubtaskOut] = []
