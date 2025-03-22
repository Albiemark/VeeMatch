import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        message: 'Missing Supabase environment variables',
        status: 'env_error'
      }, { status: 500 });
    }

    console.log('Initializing admin Supabase client for bucket creation');
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // List existing buckets to see what we have
    console.log('Listing existing buckets');
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return NextResponse.json({
        success: false,
        message: `Error listing buckets: ${bucketsError.message}`,
        status: 'list_error'
      }, { status: 500 });
    }
    
    console.log('Existing buckets:', buckets?.map(b => b.name) || []);

    // Check if photos bucket exists
    const photosBucket = buckets?.find(b => b.name === 'photos');
    
    // Create bucket if it doesn't exist
    if (!photosBucket) {
      console.log('Creating photos bucket');
      const { data: bucket, error: createError } = await supabaseAdmin.storage.createBucket('photos', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json({
          success: false,
          message: `Error creating bucket: ${createError.message}`,
          status: 'create_error'
        }, { status: 500 });
      }

      console.log('Photos bucket created successfully');
    } else {
      console.log('Photos bucket already exists, updating settings');
      
      // Update bucket to be public
      const { error: updateError } = await supabaseAdmin.storage.updateBucket('photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      });

      if (updateError) {
        console.error('Error updating bucket:', updateError);
        return NextResponse.json({
          success: false,
          message: `Error updating bucket: ${updateError.message}`,
          status: 'update_error'
        }, { status: 500 });
      }
      
      console.log('Photos bucket updated successfully');
    }

    // Try to create a test file to verify permissions
    console.log('Testing bucket access with a test file');
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload('test/api-test.txt', testBlob, { upsert: true });

    if (uploadError) {
      console.error('Error uploading test file:', uploadError);
      return NextResponse.json({
        success: true,
        warning: true,
        message: 'Bucket configured but test upload failed: ' + uploadError.message,
        buckets: buckets?.map(b => b.name) || []
      });
    }

    console.log('Test file uploaded successfully');

    // Final check - try to list files
    const { data: files, error: listError } = await supabaseAdmin.storage.from('photos').list();
    
    return NextResponse.json({
      success: true,
      message: 'Photos bucket configured successfully',
      buckets: buckets?.map(b => b.name) || [],
      canListFiles: !listError,
      listError: listError ? listError.message : null,
      files: files || [],
      testUpload: uploadData
    });
  } catch (error) {
    console.error('Bucket creation error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      status: 'exception'
    }, { status: 500 });
  }
} 