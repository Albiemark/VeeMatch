import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Image Upload</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
        button { padding: 10px 20px; background: #f0506e; color: white; border: none; border-radius: 4px; cursor: pointer; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 300px; }
        .result { margin-top: 20px; }
        .error { color: #e53e3e; }
        .success { color: #38a169; }
        .steps { margin-top: 15px; }
        .step { margin: 5px 0; padding: 5px; border-left: 3px solid #cbd5e0; padding-left: 10px; }
        .diagnostics { background: #f0f4f8; padding: 15px; border-radius: 4px; margin-top: 15px; }
        h3 { margin-top: 25px; }
      </style>
    </head>
    <body>
      <h1>VeeMatch Storage Tests</h1>
      
      <div>
        <h2>Supabase Service Status</h2>
        <a href="https://status.supabase.com/" target="_blank">Check Supabase Service Status</a>
        <p>If Supabase is reporting outages or incidents, that may explain upload issues.</p>
      </div>
      
      <div>
        <h2>1. Test Direct Image Upload to Supabase</h2>
        <p>This will attempt to upload the me.jpg image from your public folder to Supabase.</p>
        <button id="testBtn">Test Upload Now</button>
        
        <div id="result" class="result">
          <p>Click the button to start the test...</p>
        </div>
      </div>
      
      <div style="margin-top: 30px;">
        <h2>2. Environment Check</h2>
        <button id="envBtn">Check Environment</button>
        <div id="envResult"></div>
      </div>
      
      <script>
        // Test upload function
        document.getElementById('testBtn').addEventListener('click', async function() {
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = '<p>Testing upload, please wait...</p>';
          
          try {
            // Use a relative URL for the API endpoint
            const apiUrl = '/api/test-storage';
            
            resultDiv.innerHTML += '<p>Sending request to API endpoint...</p>';
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
              resultDiv.innerHTML += '<p class="error">Server responded with status: ' + response.status + ' - ' + response.statusText + '</p>';
            }
            
            const data = await response.json();
            console.log('Test result:', data);
            
            let html = '<h3 class="' + (data.success ? 'success' : 'error') + '">Test Result: ' + (data.success ? '✅ Success' : '❌ Failed') + '</h3>' +
              '<p>' + data.message + '</p>';
            
            // Add diagnostics if available
            if (data.diagnostics) {
              html += '<div class="diagnostics">';
              html += '<h3>Diagnostics:</h3>';
              
              html += '<p><strong>Supabase URL:</strong> ' + data.diagnostics.supabaseUrl + '</p>' +
                '<p><strong>Anon Key Present:</strong> ' + (data.diagnostics.anonKeyPresent ? 'Yes' : 'No') + '</p>' +
                '<p><strong>Service Role Key Present:</strong> ' + (data.diagnostics.serviceRoleKeyPresent ? 'Yes' : 'No') + '</p>';
              
              // Add steps
              if (data.diagnostics.steps && data.diagnostics.steps.length > 0) {
                html += '<div class="steps">';
                html += '<h4>Steps Completed:</h4>';
                html += '<ol>';
                data.diagnostics.steps.forEach(step => {
                  html += '<li class="step">' + step + '</li>';
                });
                html += '</ol>';
                html += '</div>';
              }
              
              // Add errors
              if (data.diagnostics.errors && data.diagnostics.errors.length > 0) {
                html += '<div class="steps">';
                html += '<h4 class="error">Errors:</h4>';
                html += '<ul>';
                data.diagnostics.errors.forEach(err => {
                  html += '<li class="step error">' + err + '</li>';
                });
                html += '</ul>';
                html += '</div>';
              }
              
              html += '</div>'; // Close diagnostics
            }
            
            // Show image if uploaded successfully
            if (data.publicUrl) {
              html += '<div>' +
                '<h3>Uploaded Image:</h3>' +
                '<img src="' + data.publicUrl + '" alt="Uploaded image" style="max-width: 300px; border: 1px solid #ddd;" />' +
                '<p><a href="' + data.publicUrl + '" target="_blank">View full size</a></p>' +
              '</div>';
            }
            
            // Add technical details
            html += '<h3>Technical Details:</h3>' +
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            
            resultDiv.innerHTML = html;
          } catch (error) {
            console.error('Test error:', error);
            resultDiv.innerHTML = '<h3 class="error">Test Error</h3>' +
              '<p>An error occurred while testing: ' + error.message + '</p>' +
              '<pre>' + (error.stack || 'No stack trace available') + '</pre>';
          }
        });
        
        // Environment check function
        document.getElementById('envBtn').addEventListener('click', async function() {
          const envDiv = document.getElementById('envResult');
          envDiv.innerHTML = '<p>Checking environment...</p>';
          
          try {
            // Check browser features
            const checks = [
              { name: 'Fetch API', support: typeof fetch !== 'undefined' },
              { name: 'Blob API', support: typeof Blob !== 'undefined' },
              { name: 'File API', support: typeof File !== 'undefined' },
              { name: 'Async/Await', support: (function() { try { eval('(async function() {})()'); return true; } catch (e) { return false; } })() }
            ];
            
            let html = '<h3>Browser Support</h3>';
            html += '<ul>';
            
            checks.forEach(check => {
              html += '<li>' + check.name + ': ' + (check.support ? '✅ Supported' : '❌ Not supported') + '</li>';
            });
            
            html += '</ul>';
            
            // Use location from client side
            html += '<p><strong>Current location:</strong> <span id="currentUrl"></span></p>';
            html += '<script>document.getElementById("currentUrl").textContent = window.location.origin;</script>';
            
            envDiv.innerHTML = html;
          } catch (error) {
            envDiv.innerHTML = '<p class="error">Error checking environment: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 