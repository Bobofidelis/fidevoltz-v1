import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Simple test endpoint to verify file writing works
export async function POST(request: NextRequest) {
  try {
    console.log('[TEST-UPLOAD] Starting test upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    
    console.log(`[TEST-UPLOAD] File received: ${file.name}, size: ${file.size}`);
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`[TEST-UPLOAD] Buffer created, size: ${buffer.length}`);
    
    // Create test path
    const testPath = join(process.cwd(), 'apps', 'web', 'public', 'uploads', 'images', 'test-upload.jpg');
    console.log(`[TEST-UPLOAD] Writing to: ${testPath}`);
    
    // Write file
    await writeFile(testPath, buffer);
    console.log('[TEST-UPLOAD] File written successfully!');
    
    return NextResponse.json({ 
      success: true, 
      path: testPath,
      size: buffer.length,
      message: 'File saved successfully'
    });
  } catch (error: any) {
    console.error('[TEST-UPLOAD] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
