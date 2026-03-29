const socket = io();
const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');
const progressFill = document.getElementById('progressFill');
const downloadLink = document.getElementById('downloadLink');
let currentId = null;
let videoTitle = '';

downloadBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) return;

  downloadBtn.disabled = true;
  downloadBtn.textContent = '🚀 Starting...';
  statusDiv.innerHTML = '<div style="text-align: center;">🔄 Initializing download...</div>';
  progressFill.style.width = '0%';
  downloadLink.style.display = 'none';

  try {
    const response = await fetch('/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, directDownload: false })
    });
    const data = await response.json();
    currentId = data.id;
    console.log('Download ID:', currentId);
  } catch (error) {
    statusDiv.innerHTML = '<div style="color: #ff4444; text-align: center;">❌ Connection error: ' + error.message + '</div>';
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download';
  }
});

socket.on('download_update', (data) => {
  console.log('Socket update:', data);
  if (data.id === currentId) {
    const percent = Math.round(data.progress * 100);
    
    if (data.status === 'starting') {
      statusDiv.innerHTML = `
        <div style="text-align: center;">
          <i class="fas fa-cog fa-spin" style="font-size: 32px; color: #3498db; margin-bottom: 10px;"></i>
          <div>🔄 Preparing download...</div>
        </div>`;
    } else if (data.status === 'downloading') {
      // DOWNLOADING NOTIFICATION WITH VIDEO INFO
      statusDiv.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 22px; color: #e74c3c; margin-bottom: 10px; font-weight: bold;">
            📹 DOWNLOADING YOUR VIDEO
          </div>
          <div style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">
            ${percent}%
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
        </div>`;
      progressFill.style.width = percent + '%';
    } else if (data.status === 'complete') {
      // SUCCESS POPUP
      statusDiv.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 34px; color: #27ae60; margin-bottom: 15px; animation: bounce 0.8s, glow 2s;">
            <i class="fas fa-check-circle" style="font-size: 50px; margin-right: 10px;"></i>
            ✅ VIDEO DOWNLOADED!
          </div>
          <div style="color: #2c3e50; font-size: 16px; background: #ecf0f1; padding: 15px; border-radius: 12px;">
            📁 <strong>${data.fileName || 'video.mp4'}</strong><br>
            💾 Size: <strong>${(data.size/1024/1024).toFixed(2)} MB</strong>
          </div>
        </div>`;
      
      progressFill.style.width = '100%';
      progressFill.classList.add('complete');
      
      downloadBtn.disabled = false;
      downloadBtn.textContent = '🎉 New Download';
      if (data.file) {
        downloadLink.href = data.file;
        downloadLink.textContent = '💾 Save Video to Device';
        downloadLink.style.display = 'block';
      }
    } else if (data.status === 'error') {
      statusDiv.innerHTML = `
        <div style="text-align: center; color: #ff4444;">
          <i class="fas fa-exclamation-triangle" style="font-size: 40px; margin-bottom: 10px;"></i>
          ❌ ${data.error || 'Download failed'}
        </div>`;
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'Try Again';
    }
  }
});

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') downloadBtn.click();
});

