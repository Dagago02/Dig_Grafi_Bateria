# Import all the models so that Base has them before being
# imported by Alembic or used for migrations.
# ORDER MATTERS: models that are referenced by foreign keys must be imported first.

from app.db.session import Base  # noqa

# Level 0 – no foreign keys
from app.models.company import Company  # noqa
from app.models.question import Question  # noqa

# Level 1 – depends on Company
from app.models.evaluation import Evaluation  # noqa

# Level 2 – depends on Company + Evaluation
from app.models.participant import Participant  # noqa

# Level 3 – depends on Participant + Question
from app.models.answer import Answer  # noqa

# Level 3 – depends on Participant
from app.models.result import Result  # noqa
