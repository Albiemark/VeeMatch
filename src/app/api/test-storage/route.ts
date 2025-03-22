import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

interface Diagnostics {
  supabaseUrl: string;
  anonKeyPresent: boolean;
  serviceRoleKeyPresent: boolean;
  steps: string[];
  errors: string[];
}

export async function GET() {
  try {
    // Create a diagnostics object to collect information
    const diagnostics: Diagnostics = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      anonKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKeyPresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      steps: [],
      errors: []
    };

    try {
      diagnostics.steps.push('Initializing Supabase client');
      const client = getSupabaseClient();
      
      // Test connection by checking buckets
      diagnostics.steps.push('Listing buckets to test connection');
      const { data: buckets, error: bucketsError } = await client.storage.listBuckets();
      
      if (bucketsError) {
        diagnostics.errors.push(`Bucket listing error: ${bucketsError.message}`);
        // Continue to other tests despite this error
      } else {
        diagnostics.steps.push(`Successfully listed buckets: ${buckets?.map(b => b.name).join(', ') || 'none'}`);
      }
      
      // Check file existence
      const imagePath = '/home/mark/Documents/GitHub/VeeMatch/public/me.jpg';
      diagnostics.steps.push(`Checking if file exists at: ${imagePath}`);
      
      if (!fs.existsSync(imagePath)) {
        diagnostics.errors.push(`Image file not found at path: ${imagePath}`);
        return NextResponse.json({
          success: false,
          message: 'Image file not found at specified path',
          diagnostics,
          path: imagePath
        }, { status: 404 });
      }
      
      diagnostics.steps.push('File exists, reading file content');
      // Get file stats
      const stats = fs.statSync(imagePath);
      diagnostics.steps.push(`File size: ${stats.size} bytes`);
      
      // Skip upload if Supabase is having issues
      if (diagnostics.errors.length > 0) {
        diagnostics.steps.push('Skipping upload due to earlier errors');
        return NextResponse.json({
          success: false,
          message: 'Skipping upload due to Supabase connection issues',
          diagnostics
        }, { status: 503 });
      }
      
      // Proceed with upload
      try {
        diagnostics.steps.push('Reading file from disk');
        const fileBuffer = fs.readFileSync(imagePath);
        diagnostics.steps.push(`File read successfully (${fileBuffer.length} bytes)`);
        
        const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });
        diagnostics.steps.push('File blob created');
        
        // Upload with a unique filename
        const filename = `test-upload-${Date.now()}.jpg`;
        diagnostics.steps.push(`Attempting upload with filename: ${filename}`);
        
        const { data: uploadData, error: uploadError } = await client.storage
          .from('photos')
          .upload(filename, fileBlob, {
            upsert: true,
            contentType: 'image/jpeg'
          });
        
        if (uploadError) {
          diagnostics.errors.push(`Upload error: ${uploadError.message}`);
          return NextResponse.json({
            success: false,
            message: `Upload failed: ${uploadError.message}`,
            diagnostics
          }, { status: 500 });
        }
        
        diagnostics.steps.push('Upload successful');
        
        // Try to get public URL
        const { data: urlData } = client.storage
          .from('photos')
          .getPublicUrl(filename);
        
        diagnostics.steps.push('Retrieved public URL');
        
        return NextResponse.json({
          success: true,
          message: 'Storage test completed successfully',
          diagnostics,
          uploadData,
          publicUrl: urlData.publicUrl
        });
      } catch (uploadErr) {
        diagnostics.errors.push(`Upload process error: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}`);
        return NextResponse.json({
          success: false,
          message: 'Error during file upload process',
          diagnostics
        }, { status: 500 });
      }
    } catch (innerError) {
      diagnostics.errors.push(`Supabase operation error: ${innerError instanceof Error ? innerError.message : 'Unknown error'}`);
      return NextResponse.json({
        success: false,
        message: 'Error with Supabase operations',
        diagnostics
      }, { status: 500 });
    }
  } catch (error) {
    // Catch-all error handler
    console.error('Storage test critical error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown critical error',
      error: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
} 