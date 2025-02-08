from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

class AsyncDatabaseManager:
    def __init__(self, database_url: str = "sqlite+aiosqlite:///./test.db") -> None:
        self.engine = create_async_engine(database_url, echo=True)
        self.async_session = async_sessionmaker(
            bind=self.engine, expire_on_commit=False
        )

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.async_session() as session:
            yield session

# Initialize default database manager
async_db_manager = AsyncDatabaseManager()
