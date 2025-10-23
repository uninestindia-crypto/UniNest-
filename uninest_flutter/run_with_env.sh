#!/bin/bash
# Script to run Flutter app with environment variables

# Load environment variables from .env file
export $(cat .env | xargs)

# Run Flutter with environment variables
flutter run \
  --dart-define=SUPABASE_URL=$SUPABASE_URL \
  --dart-define=SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  --dart-define=RAZORPAY_KEY=$RAZORPAY_KEY \
  --dart-define=API_BASE_URL=$API_BASE_URL
