# Photo Storage Configuration for Render

This document explains the photo storage setup for the matrimony services API when deployed on Render.

## Storage Architecture

The application supports two storage modes:

### 1. Local Development
- **Path**: `uploads/` (relative to project root)
- **Structure**: `uploads/accounts/{accountId}/profiles/{profileId}/photos/`
- **Access**: Static files served via Express

### 2. Render Production (Persistent Disk)
- **Path**: `/photos` (Render disk mount point)
- **Structure**: `/photos/accounts/{accountId}/profiles/{profileId}/photos/`
- **Access**: Static files served from mounted disk

## Render Configuration

### Disk Setup
1. **Mount Path**: `/photos`
2. **Size**: 10GB (as shown in your screenshot)
3. **Type**: Persistent disk storage

### Environment Variables
```
RENDER=true
NODE_ENV=production
```

### File Structure on Render
```
/photos/
├── accounts/
│   ├── {account_id_1}/
│   │   ├── profiles/
│   │   │   ├── {profile_id_1}/
│   │   │   │   ├── photos/
│   │   │   │   │   ├── profile-1234567890.jpg
│   │   │   │   │   ├── cover-1234567891.jpg
│   │   │   │   │   └── additional-1234567892.jpg
│   │   │   └── {profile_id_2}/
│   │   │       └── photos/
│   │   └── ...
│   └── {account_id_2}/
└── temp/ (for temporary files)
```

## Code Changes Made

### 1. Updated Storage Configuration
- Modified `multer.diskStorage` to use environment-aware paths
- Added environment detection functions
- Updated destination path logic

### 2. Enhanced Server Configuration
- Updated Express static file serving
- Added proper cache headers for image files
- Maintained backward compatibility for legacy uploads

### 3. Environment-Aware URL Generation
- URLs always use `/photos/` prefix for client access
- Automatic path conversion for different environments
- Proper relative path handling

## Photo Upload Process

1. **Client uploads photo** → POST `/api/profile/photo`
2. **Multer processes file** → Saves to appropriate storage path
3. **Database stores URL** → `/photos/accounts/{accountId}/profiles/{profileId}/photos/{filename}`
4. **Client accesses photo** → GET `/photos/accounts/{accountId}/profiles/{profileId}/photos/{filename}`

## Benefits of Render Persistent Storage

1. **Persistence**: Files survive deployments and restarts
2. **Performance**: Direct file system access (no API calls)
3. **Cost-effective**: No external storage service fees
4. **Simplicity**: Standard file operations
5. **Scalability**: Easy to resize disk as needed

## File Upload Limits

- **Max file size**: 5MB per photo
- **Allowed formats**: JPEG, PNG, WebP
- **Max files per request**: 1
- **Photo types**: Profile (450), Cover (454), Additional (456)

## URL Structure

### Development
```
http://localhost:3000/photos/accounts/123/profiles/456/photos/profile-1234567890.jpg
```

### Production (Render)
```
https://yourapp.onrender.com/photos/accounts/123/profiles/456/photos/profile-1234567890.jpg
```

## Monitoring and Maintenance

### Disk Usage
- Monitor disk usage through Render dashboard
- Current allocation: 10GB
- Can be increased as needed

### File Cleanup
- Implement periodic cleanup for unused files
- Remove orphaned files when profiles are deleted
- Consider implementing file archival for old photos

## Troubleshooting

### Common Issues
1. **Permission errors**: Ensure proper directory permissions (755)
2. **Path not found**: Verify mount path configuration
3. **Files not persisting**: Check if persistent disk is properly mounted

### Debug Commands
```bash
# Check disk mount
df -h

# Verify directory structure
ls -la /photos/

# Check file permissions
ls -la /photos/accounts/
```

## Security Considerations

1. **File validation**: Only allow approved image formats
2. **Size limits**: Prevent large file uploads
3. **Path traversal**: Sanitize filenames and paths
4. **Access control**: Verify user permissions before file access
5. **Rate limiting**: Implement upload rate limits per user

## Future Enhancements

1. **Image optimization**: Auto-resize and compress uploads
2. **CDN integration**: Serve images through CDN for better performance
3. **Backup strategy**: Regular backups of photo storage
4. **Multi-format support**: Generate multiple sizes (thumbnail, medium, full)
5. **Analytics**: Track storage usage and popular images