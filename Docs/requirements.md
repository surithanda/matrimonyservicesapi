## Upload Profile Photo
Receives: profile_id, photo_type, caption, file
Step 1: existingPhotos = CALL eb_profile_photo_get(profile_id)
Step 2: exactMatch = existingPhotos.find(p.caption === caption)
━━━━━━━━━━━━━━━━ REPLACE (exactMatch found) ━━━━━━━━━━━━━━━━
Step R1: CALL eb_profile_photo_delete(exactMatch.photo_id, profile_id, email)
         → Count drops: N → N-1 (critical: must happen BEFORE create to stay under 7 limit)
         → Check SP result — log if fail, but proceed
Step R2: Upload to Azure (same blobName → auto-overwrites old blob, no explicit delete needed)
Step R3: Upload thumbnail (same thumbBlobName → auto-overwrites)
Step R4: mainUrl = buildPublicUrl(blobName)  ← full URL, now safe at VARCHAR(500)
Step R5: CALL eb_profile_photo_create(profile_id, mainUrl, photo_type, caption, desc, email)
         → Check result.status:
             'success' → proceed
             'fail'    → delete new Azure blobs + return 400 with error_message
Step R6: UPDATE profile_photo SET relative_path = blobName (table: profile_photo singular)
━━━━━━━━━━━━━━━━ NEW (no match) ━━━━━━━━━━━━━━━━
Step N1: if existingPhotos.length >= 7 → return 400 "Maximum 7 photos"
Step N2: Upload to Azure (new blobName)
Step N3: Upload thumbnail (new thumbBlobName)
Step N4: mainUrl = buildPublicUrl(blobName)
Step N5: CALL eb_profile_photo_create(profile_id, mainUrl, photo_type, caption, desc, email)
         → Check result.status:
             'success' → proceed
             'fail'    → delete both Azure blobs + return 400 with error_message
Step N6: UPDATE profile_photo SET relative_path = blobName (table: profile_photo singular)
━━━━━━━━━━━━━━━━
Return 201 { success: true, message: "Uploaded successfully" }

lookup_table — Correct Mapping
id	name	What SP allows
450	Clear Headshot	Max 1 per profile
451	Full-body shot	Max 1 per profile
452	Casual or Lifestyle Shot	Max 1 per profile
453	Family Photo	Max 1 per profile
454	Candid or Fun Moment	Max 1 per profile
455	Hobby or Activity Photo	Max 1 per profile
456	Other	Max 2 per profile (caption != 'Other')