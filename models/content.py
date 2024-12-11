from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Content(BaseModel):
    title: str = Field(..., min_length=1)
    started: datetime = Field(default_factory=datetime.now)
    finished: Optional[datetime] = None
    progress: int = Field(..., ge=0, le=100)

