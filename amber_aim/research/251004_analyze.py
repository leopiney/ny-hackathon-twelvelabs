# %%

from aim.config import Settings
from aim.services import S3Service
from aim.services.twelve_labs_service import TwelveLabsService

settings = Settings()
s3_service = S3Service(
    bucket_name=settings.aws_s3_bucket,
    region=settings.aws_region,
    base_path=settings.s3_base_path,
)
twelve_labs_service = TwelveLabsService(
    api_key=settings.twelve_labs_api_key,
    creators_index_id=settings.twelve_labs_creators_index_id,
    ads_index_id=settings.twelve_labs_ads_index_id,
    s3_service=s3_service,
)
# %%

tasks = twelve_labs_service.client.tasks.list(
    index_id=settings.twelve_labs_creators_index_id,
)

for task in tasks:
    print(task)
# %%
# id='68e1899a830688fe0b91e228' video_id='68e1899a830688fe0b91e228' created_at='2025-10-04T20:54:52.485Z' updated_at='2025-10-04T20:58:45.597Z' status='ready' index_id='68e185e43a1b0bed6c1355f2' system_metadata=VideoIndexingTaskSystemMetadata(duration=350.0, filename='84e04e99-8116-4a8c-b558-504c6204ed9b.mp4', height=720, width=1280)

twelve_labs_service.analyze_video(
    index_id="68e185e43a1b0bed6c1355f2",
    video_id="68e1899a830688fe0b91e228",
    video_path="uploads/84e04e99-8116-4a8c-b558-504c6204ed9b.mp4",
    type="creator",
)
# %%
