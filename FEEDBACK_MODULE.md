# Customer Feedback Module - Complete Setup Guide

## Overview
The Customer Feedback module has been migrated from mock data to real database-backed API integration.

## Database Schema
The `customer_feedback` table includes:
- Customer information (name, email)
- Feedback details (type, rating, message)
- Status tracking (new, reviewed, responded, closed)
- Admin response and timestamps

## Backend Setup

### Seed Database
```bash
cd backend
npm run seed-feedback
```

This seeds 15 sample feedback records:
- **6 New** feedback (needs attention)
- **4 Reviewed** feedback (under investigation)
- **5 Responded** feedback (already handled)
- Various types: complaint, suggestion, product, service, general
- Ratings from 1-5 stars
- Timestamps ranging from 3 hours to 9 days ago

### API Endpoints

All endpoints require admin authentication:

#### GET `/api/admin/feedback`
Fetch all customer feedback
- Query params: `status`, `type`, `page`, `limit`
- Returns: paginated feedback list

#### PATCH `/api/admin/feedback/:id`
Update feedback status
- Body: `{ status: 'new' | 'reviewed' | 'responded' | 'closed', admin_response?: string }`

#### POST `/api/admin/feedback/:id/respond`
Send response to customer
- Body: `{ response: string }`
- Automatically updates status to 'responded'

## Frontend Implementation

### Key Features

#### 1. **Display Logic**
- ✅ Shows **only non-responded feedback** in the main list
- ✅ Includes **responded count** in stats cards
- ✅ Real-time stats calculated from all feedback in DB

#### 2. **Stats Cards**
Four summary cards showing:
- **New Feedback** (blue) - Needs initial review
- **Under Review** (yellow) - Being investigated
- **Responded** (green) - Already handled (not in list)
- **Avg Rating** (purple) - Overall customer satisfaction

#### 3. **Feedback List**
Each item displays:
- Customer name and email
- Feedback type badge (complaint, suggestion, product, service, general)
- Status badge (new, reviewed)
- Star rating (1-5)
- Feedback message
- Submission date
- Action buttons based on status

#### 4. **Actions**
- **Mark Reviewed**: Changes status from `new` → `reviewed`
- **Respond**: Opens modal to write admin response
  - Automatically changes status to `responded`
  - Removes item from list after response
- No "Close" button needed (responded items hidden)

### Removed Mock Data
Completely removed:
- ✅ Mock feedback arrays
- ✅ localStorage persistence
- ✅ Fallback data loading
- ✅ Static initialization from parent component

### Data Flow
1. Component mounts → `fetchAllFeedback()` called
2. Fetches ALL feedback from `/api/admin/feedback`
3. Calculates stats from complete dataset
4. Filters out `status === 'responded'` for display list
5. User takes action (respond/update status)
6. Refetches data to update UI

## Usage Instructions

### Starting the System

1. **Ensure database is configured** in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://..."
   ```

2. **Seed feedback data**:
   ```bash
   cd backend
   npm run seed-feedback
   ```

3. **Start backend**:
   ```bash
   npm run dev
   ```

4. **Start admin panel**:
   ```bash
   cd ../amzify-admin-panel
   npm run dev
   ```

5. **Access feedback module**:
   - Login as admin
   - Click "FEEDBACK" tab
   - View pending feedback (responded items excluded)
   - See responded count in green stats card

### Admin Workflow

1. **Review New Feedback**
   - Blue "New Feedback" card shows count
   - Each item has "Mark Reviewed" button
   - Click to change status to "Under Review"

2. **Respond to Feedback**
   - Click "Respond" button on any new/reviewed item
   - Modal opens with customer's feedback
   - Write response in textarea
   - Click "Send Response"
   - Item disappears from list (status → responded)
   - Responded count increases in green card

3. **Monitor Stats**
   - **New** (blue): Immediate attention needed
   - **Under Review** (yellow): Being investigated
   - **Responded** (green): Already handled
   - **Avg Rating**: Customer satisfaction metric

## Testing

### Verify Seed Data
After running `npm run seed-feedback`:
```
✓ Seeded 15 customer feedback records
  - New: 6
  - Under Review: 4
  - Responded: 5
  - Average Rating: 3.53/5
```

### Test Frontend
1. Login to admin panel
2. Navigate to Feedback tab
3. **Expected results**:
   - Blue card: 6 new feedback
   - Yellow card: 4 under review
   - Green card: 5 responded
   - Purple card: ~3.5 avg rating
   - **List shows 10 items** (6 new + 4 reviewed)
   - **5 responded items NOT in list**

4. **Test actions**:
   - Click "Mark Reviewed" on new feedback → status changes
   - Click "Respond" → modal opens
   - Write response → click "Send Response"
   - Item disappears from list
   - Responded count increases by 1

## API Response Format

### GET /api/admin/feedback
```json
{
  "feedback": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "type": "complaint",
      "rating": 2,
      "message": "Feedback message...",
      "status": "new",
      "admin_response": null,
      "responded_at": null,
      "created_at": "2026-02-03T10:00:00Z",
      "updated_at": "2026-02-03T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

## Troubleshooting

### No Feedback Showing
- Run seed script: `npm run seed-feedback`
- Check backend logs for errors
- Verify admin token is valid

### Responded Items Still Visible
- Clear browser cache
- Check filter logic in `FeedbackTab`
- Verify `status !== 'responded'` filter

### Stats Not Updating
- Check `fetchAllFeedback()` is called after actions
- Verify API returns all feedback (not filtered)
- Ensure stats calculation uses `allFeedback` state

### Database Connection Error
- Verify DATABASE_URL in `.env`
- Check Render database is accessible
- Run migrations if needed: `npm run migrate`

## Future Enhancements

Potential improvements:
- Email notifications to customers when responded
- Feedback categories filtering
- Export feedback to CSV
- Sentiment analysis on feedback messages
- Auto-response templates
- Feedback trending analytics
