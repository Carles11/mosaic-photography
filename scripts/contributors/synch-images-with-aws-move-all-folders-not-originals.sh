#!/bin/bash
# Sync local webp images to S3
# ADD --dryrun at the end of the command to see what would be uploaded without actually uploading

aws s3 sync "C:\Users\elcar\Documents\WEBs\Mosaic\Contributors\elcarles" s3://mosaic.photography/mosaic-collections/community/photography/elcarles --exclude "originals/*"