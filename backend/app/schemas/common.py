"""Shared enums and types for schemas."""

from enum import Enum


class Status(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    COMPLETED = "completed"
    ARCHIVED = "archived"
