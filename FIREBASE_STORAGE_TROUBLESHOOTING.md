# Firebase Storage CORS Troubleshooting Guide

## 🚨 CORS Error Solution

The CORS error you're experiencing is common when uploading to Firebase Storage from localhost. Here are the steps to fix it:

### Option 1: Configure CORS via Google Cloud CLI (Recommended)

1. **Install Google Cloud CLI** (if not already installed):

   ```bash
   # macOS
   brew install google-cloud-sdk

   # Windows
   # Download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**:

   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Run the CORS configuration script**:
   ```bash
   node scripts/configure-firebase-storage-cors.js
   ```

### Option 2: Manual CORS Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**
3. **Navigate to Storage > Rules**
4. **Update the rules** with the content from `firebase-storage.rules`
5. **Deploy the rules**:
   ```bash
   firebase deploy --only storage
   ```

### Option 3: Quick Fix via Firebase Console

1. Go to **Firebase Console > Storage**
2. Click on **Rules** tab
3. Replace the rules with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /bonsai/{bonsaiId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null
                      && request.auth.uid != null
                      && request.resource.size < 10 * 1024 * 1024
                      && request.resource.contentType.matches('image/.*');
       }
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```
4. Click **Publish**

## 🔧 Environment Variables Check

Make sure these environment variables are set in your `.env` file:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🧪 Testing the Configuration

1. **Check if CORS is configured**:

   ```bash
   gsutil cors get gs://YOUR_STORAGE_BUCKET
   ```

2. **Test upload functionality**:
   - Try uploading a small image file
   - Check browser console for specific error messages
   - Verify the image appears in Firebase Storage console

## 🐛 Common Issues and Solutions

### Issue: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**: Configure CORS rules as described above.

### Issue: "storage/unauthorized" error

**Solution**:

1. Check if user is authenticated
2. Verify Firebase Storage rules allow authenticated users
3. Ensure the user has the correct permissions

### Issue: "storage/quota-exceeded" error

**Solution**:

1. Check your Firebase Storage quota
2. Upgrade your Firebase plan if needed
3. Consider implementing file size limits

### Issue: Upload works but images don't display

**Solution**:

1. Check if the download URL is correct
2. Verify the image file exists in Firebase Storage
3. Check if the image URL is accessible

## 🔍 Debugging Steps

1. **Check Browser Console**:
   - Look for specific error codes
   - Check network tab for failed requests

2. **Check Firebase Console**:
   - Go to Storage > Files
   - Verify files are being uploaded
   - Check file permissions

3. **Test with Firebase CLI**:
   ```bash
   firebase login
   firebase projects:list
   firebase use YOUR_PROJECT_ID
   ```

## 📋 Verification Checklist

- [ ] Google Cloud CLI installed and authenticated
- [ ] CORS rules configured for localhost domains
- [ ] Firebase Storage rules deployed
- [ ] Environment variables set correctly
- [ ] User is authenticated
- [ ] File size is under 10MB
- [ ] File type is image (jpg, png, etc.)

## 🆘 Still Having Issues?

1. **Check Firebase Storage Quota**: Go to Firebase Console > Usage and billing
2. **Verify Project Permissions**: Ensure your account has Storage Admin role
3. **Try Different Browser**: Test in incognito/private mode
4. **Check Network**: Ensure no firewall is blocking Firebase requests
5. **Contact Support**: If issues persist, contact Firebase support

## 📞 Quick Commands

```bash
# Check CORS configuration
gsutil cors get gs://YOUR_BUCKET_NAME

# Set CORS manually
gsutil cors set cors.json gs://YOUR_BUCKET_NAME

# Deploy Firebase Storage rules
firebase deploy --only storage

# Check Firebase project
firebase projects:list
firebase use YOUR_PROJECT_ID
```

## 🎯 Expected Behavior After Fix

- ✅ Uploads work from localhost:5173 and localhost:5174
- ✅ Images display correctly in the app
- ✅ No CORS errors in browser console
- ✅ Files appear in Firebase Storage console
- ✅ Download URLs work when accessed directly
