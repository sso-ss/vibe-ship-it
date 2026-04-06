---
name: upload-file
description: "Handles file and image uploads. Triggers: 'upload', 'add a photo', 'add an image', 'file upload', 'image upload', 'let them upload', 'upload pictures', 'attach file', 'profile picture', 'photo gallery', 'add photos', 'drag and drop'."
---

# Upload File

Lets users upload images or files. Stores them in the cloud, displays them on the site.

## Default: Supabase Storage

Already using Supabase for data, so storage is built in.

### Step 1: Create Storage Bucket

Via Supabase dashboard:
> "Go to Supabase dashboard → Storage → New Bucket.
> Name it something like 'images' or 'uploads'.
> Set it to Public if these images should be visible on your site."

Or via SQL:
```sql
insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- Allow anyone to upload (for public forms)
create policy "Anyone can upload" on storage.objects
  for insert with check (bucket_id = 'images');

-- Allow anyone to view (for public images)
create policy "Anyone can view" on storage.objects
  for select using (bucket_id = 'images');
```

### Step 2: Create Upload Component

```tsx
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file)

    if (error) {
      alert('Upload failed. Try again.')
      setUploading(false)
      return
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <label className="block cursor-pointer">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
        {uploading ? (
          <p className="text-gray-500">Uploading...</p>
        ) : (
          <>
            <p className="text-gray-500">Click to upload an image</p>
            <p className="text-sm text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
          </>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
    </label>
  )
}
```

### Step 3: Use It

In any page or form:
```tsx
import { ImageUpload } from '@/components/ImageUpload'

// In your component:
<ImageUpload onUpload={(url) => {
  // Save the URL to your database, or display it
  console.log('Uploaded:', url)
}} />
```

### Step 4: Display Uploaded Images

```tsx
// Single image
<img src={imageUrl} alt="Uploaded image" className="rounded-lg w-full max-w-md" />

// Gallery grid
<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {images.map((url) => (
    <img key={url} src={url} alt="" className="rounded-lg aspect-square object-cover" />
  ))}
</div>
```

### Step 5: Test It

> "Try uploading an image. It should appear on the page immediately. You can also check your Supabase dashboard → Storage → images to see the file."

## Variations

### Profile Picture
Upload + save URL to user record:
```typescript
// After upload, save to user profile
await supabase.from('profiles').update({
  avatar_url: publicUrl
}).eq('id', userId)
```

### Multiple Images
Allow selecting multiple files:
```tsx
<input type="file" accept="image/*" multiple onChange={handleMultiUpload} />
```

### Drag and Drop
Add drag-and-drop to the upload zone:
```tsx
<div
  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
  onDragLeave={() => setDragging(false)}
  onDrop={(e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUploadFile(file)
  }}
  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
    dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
  }`}
>
```

## File Size & Type Limits

Set reasonable defaults:
- Max file size: 5MB for images, 10MB for documents
- Accepted types: `image/*` for images, or specific extensions
- Validate before upload, show friendly error if too large

```typescript
if (file.size > 5 * 1024 * 1024) {
  alert('This image is too large. Please use one under 5MB.')
  return
}
```

## Common Issues

| Problem | Fix |
|---|---|
| "Bucket not found" | Create the bucket in Supabase dashboard |
| Upload succeeds but image doesn't display | Check bucket is set to Public |
| "Permission denied" on upload | Check storage policies — insert policy needed |
| Image loads slowly | Supabase serves from CDN, but very large images will be slow. Consider resizing before upload |
| Wrong file type uploaded | Add `accept` attribute to input and validate in JS |

## After Adding Uploads

Update the **Services** section in `PROJECT.md` with the storage bucket name and what gets uploaded. Create `PROJECT.md` if it doesn't exist.

## Platform-Specific

### Mobile (Expo)
- Use `expo-image-picker` to pick photos from camera roll or take a new one
- Upload to Supabase Storage directly from the app
- Example:
  ```tsx
  import * as ImagePicker from 'expo-image-picker'
  
  const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
  if (!result.canceled) {
    const file = result.assets[0]
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(`${Date.now()}.jpg`, { uri: file.uri, type: 'image/jpeg' })
  }
  ```
- For camera: `ImagePicker.launchCameraAsync()`
- Request permissions first: `ImagePicker.requestMediaLibraryPermissionsAsync()`

### Figma Plugin
- Not applicable — files live in Figma
- If the designer wants to export from Figma: use `node.exportAsync()` in `code.ts`
- If they want to import an image into Figma: use `figma.createImage()` with image bytes fetched from the UI iframe
