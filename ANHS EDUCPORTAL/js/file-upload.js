/**
 * File Upload Management Module
 * Provides drag-and-drop file upload with preview and progress indicators
 */

class FileUploader {
  constructor(options = {}) {
    this.options = {
      maxFiles: options.maxFiles || 5,
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedTypes: options.allowedTypes || [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip', 'application/x-zip-compressed'
      ],
      uploadUrl: options.uploadUrl || '/api/upload/multiple',
      container: options.container,
      onUploadComplete: options.onUploadComplete || (() => {}),
      onUploadError: options.onUploadError || (() => {}),
      onFileAdded: options.onFileAdded || (() => {}),
      onFileRemoved: options.onFileRemoved || (() => {})
    };

    this.files = [];
    this.uploadedFiles = [];
    this.isUploading = false;

    if (this.options.container) {
      this.initialize();
    }
  }

  /**
   * Initialize the file uploader
   */
  initialize() {
    this.createUploadArea();
    this.bindEvents();
  }

  /**
   * Create the upload area HTML
   */
  createUploadArea() {
    const container = typeof this.options.container === 'string'
      ? document.querySelector(this.options.container)
      : this.options.container;

    if (!container) return;

    container.innerHTML = `
      <div class="file-upload-area">
        <div class="upload-zone" id="uploadZone">
          <div class="upload-zone-content">
            <i class="fas fa-cloud-upload-alt upload-icon"></i>
            <h3>Drag & drop files here</h3>
            <p>or <span class="upload-link">browse files</span></p>
            <small class="upload-hint">
              Maximum ${this.options.maxFiles} files, up to ${(this.options.maxFileSize / (1024 * 1024)).toFixed(0)}MB each
            </small>
          </div>
          <input type="file" id="fileInput" multiple style="display: none;">
        </div>
        <div class="file-list" id="fileList"></div>
        <div class="upload-actions" id="uploadActions" style="display: none;">
          <button type="button" class="btn btn-primary" id="uploadBtn">
            <i class="fas fa-upload"></i> Upload Files
          </button>
          <button type="button" class="btn btn-secondary" id="clearBtn">
            <i class="fas fa-trash"></i> Clear All
          </button>
        </div>
        <div class="upload-progress" id="uploadProgress" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="progress-text" id="progressText">Uploading...</div>
        </div>
      </div>
    `;

    // Add CSS styles
    this.addStyles();
  }

  /**
   * Add required CSS styles
   */
  addStyles() {
    if (document.getElementById('file-upload-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'file-upload-styles';
    styles.textContent = `
      .file-upload-area {
        font-family: inherit;
      }

      .upload-zone {
        border: 2px dashed var(--border-color, #d1d5db);
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        background: var(--card-bg, #ffffff);
        transition: all 0.3s ease;
        cursor: pointer;
        margin-bottom: 20px;
      }

      .upload-zone:hover,
      .upload-zone.dragover {
        border-color: var(--primary-color, #1a6633);
        background: var(--primary-light, rgba(26, 102, 51, 0.05));
      }

      .upload-icon {
        font-size: 3rem;
        color: var(--text-secondary, #6b7280);
        margin-bottom: 15px;
      }

      .upload-zone h3 {
        margin: 0 0 10px 0;
        color: var(--text-primary, #111827);
        font-size: 1.25rem;
      }

      .upload-zone p {
        margin: 0 0 10px 0;
        color: var(--text-secondary, #6b7280);
      }

      .upload-link {
        color: var(--primary-color, #1a6633);
        text-decoration: underline;
        cursor: pointer;
      }

      .upload-hint {
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      .file-list {
        margin-bottom: 20px;
      }

      .file-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 6px;
        background: var(--card-bg, #ffffff);
        margin-bottom: 8px;
        transition: all 0.2s ease;
      }

      .file-item:hover {
        border-color: var(--primary-color, #1a6633);
      }

      .file-preview {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-light, rgba(26, 102, 51, 0.1));
        color: var(--primary-color, #1a6633);
        flex-shrink: 0;
      }

      .file-info {
        flex: 1;
        min-width: 0;
      }

      .file-name {
        font-weight: 500;
        color: var(--text-primary, #111827);
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-size {
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
      }

      .file-status {
        margin-left: 12px;
        flex-shrink: 0;
      }

      .status-uploading {
        color: var(--primary-color, #1a6633);
      }

      .status-success {
        color: #10b981;
      }

      .status-error {
        color: #ef4444;
      }

      .file-actions {
        margin-left: 12px;
        flex-shrink: 0;
      }

      .remove-file {
        background: none;
        border: none;
        color: var(--text-secondary, #6b7280);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .remove-file:hover {
        background: #fee2e2;
        color: #ef4444;
      }

      .upload-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-bottom: 20px;
      }

      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .btn-primary {
        background: var(--primary-color, #1a6633);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-dark, #145a2a);
      }

      .btn-secondary {
        background: var(--border-color, #e5e7eb);
        color: var(--text-primary, #111827);
      }

      .btn-secondary:hover {
        background: #d1d5db;
      }

      .upload-progress {
        margin-top: 20px;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--border-color, #e5e7eb);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: var(--primary-color, #1a6633);
        width: 0%;
        transition: width 0.3s ease;
      }

      .progress-text {
        text-align: center;
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
      }

      .file-upload-area.error .upload-zone {
        border-color: #ef4444;
        background: #fef2f2;
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');

    if (!uploadZone || !fileInput) return;

    // Click to browse files
    uploadZone.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag and drop events
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    // Upload button
    if (uploadBtn) {
      uploadBtn.addEventListener('click', () => {
        this.uploadFiles();
      });
    }

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearFiles();
      });
    }
  }

  /**
   * Handle selected files
   */
  handleFiles(fileList) {
    const newFiles = Array.from(fileList);

    // Validate files
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      const error = this.validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      this.showToast('Validation Errors:\n' + errors.join('\n'), 'error');
    }

    // Add valid files
    if (validFiles.length > 0) {
      this.files.push(...validFiles);
      this.updateFileList();
      this.updateUploadActions();
      this.options.onFileAdded(validFiles);
    }
  }

  /**
   * Validate a file
   */
  validateFile(file) {
    // Check file count
    if (this.files.length >= this.options.maxFiles) {
      return `Maximum ${this.options.maxFiles} files allowed`;
    }

    // Check file size
    if (file.size > this.options.maxFileSize) {
      return `File size exceeds ${(this.options.maxFileSize / (1024 * 1024)).toFixed(0)}MB limit`;
    }

    // Check file type
    if (!this.options.allowedTypes.includes(file.type)) {
      return 'File type not allowed';
    }

    return null;
  }

  /**
   * Update the file list display
   */
  updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    fileList.innerHTML = '';

    this.files.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-preview">
          ${this.getFileIcon(file.type)}
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${this.formatFileSize(file.size)}</div>
        </div>
        <div class="file-status" id="status-${index}">
          <i class="fas fa-clock status-pending"></i>
        </div>
        <div class="file-actions">
          <button type="button" class="remove-file" data-index="${index}" title="Remove file">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;

      fileList.appendChild(fileItem);
    });

    // Bind remove buttons
    fileList.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.removeFile(index);
      });
    });
  }

  /**
   * Update upload actions visibility
   */
  updateUploadActions() {
    const uploadActions = document.getElementById('uploadActions');
    if (uploadActions) {
      uploadActions.style.display = this.files.length > 0 ? 'flex' : 'none';
    }
  }

  /**
   * Remove a file from the list
   */
  removeFile(index) {
    const removedFile = this.files.splice(index, 1)[0];
    this.updateFileList();
    this.updateUploadActions();
    this.options.onFileRemoved(removedFile);
  }

  /**
   * Clear all files
   */
  clearFiles() {
    this.files = [];
    this.uploadedFiles = [];
    this.updateFileList();
    this.updateUploadActions();
  }

  /**
   * Upload files to server
   */
  async uploadFiles() {
    if (this.files.length === 0 || this.isUploading) return;

    this.isUploading = true;
    this.showProgress();

    const formData = new FormData();
    this.files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const authToken =
        (window.API && typeof window.API.getToken === 'function' ? window.API.getToken() : null) || '';
      const response = await fetch(this.options.uploadUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.uploadedFiles = result.data;
        this.updateUploadStatus('success');
        this.showToast(`Successfully uploaded ${this.files.length} file(s)`, 'success');
        this.options.onUploadComplete(result.data);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.updateUploadStatus('error');
      this.showToast('Upload failed: ' + error.message, 'error');
      this.options.onUploadError(error);
    } finally {
      this.isUploading = false;
      this.hideProgress();
    }
  }

  /**
   * Update upload status for each file
   */
  updateUploadStatus(status) {
    this.files.forEach((_, index) => {
      const statusElement = document.getElementById(`status-${index}`);
      if (statusElement) {
        const iconClass = status === 'success' ? 'fa-check-circle status-success' :
                         status === 'error' ? 'fa-exclamation-circle status-error' :
                         'fa-clock status-pending';
        statusElement.innerHTML = `<i class="fas ${iconClass}"></i>`;
      }
    });
  }

  /**
   * Show upload progress
   */
  showProgress() {
    const progressElement = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressElement) {
      progressElement.style.display = 'block';
    }

    if (progressFill) {
      progressFill.style.width = '0%';
      setTimeout(() => {
        progressFill.style.width = '100%';
      }, 100);
    }

    if (progressText) {
      progressText.textContent = `Uploading ${this.files.length} file(s)...`;
    }
  }

  /**
   * Hide upload progress
   */
  hideProgress() {
    const progressElement = document.getElementById('uploadProgress');
    if (progressElement) {
      setTimeout(() => {
        progressElement.style.display = 'none';
      }, 1000);
    }
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) {
      return '<i class="fas fa-image"></i>';
    } else if (mimeType === 'application/pdf') {
      return '<i class="fas fa-file-pdf"></i>';
    } else if (mimeType.includes('word')) {
      return '<i class="fas fa-file-word"></i>';
    } else if (mimeType.includes('zip')) {
      return '<i class="fas fa-file-archive"></i>';
    } else {
      return '<i class="fas fa-file"></i>';
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Use existing toast system if available, otherwise create simple alert
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }

  /**
   * Get uploaded files
   */
  getUploadedFiles() {
    return this.uploadedFiles;
  }

  /**
   * Set files programmatically
   */
  setFiles(files) {
    this.files = Array.from(files);
    this.updateFileList();
    this.updateUploadActions();
  }
}

// Export to window for global access
window.FileUploader = FileUploader;

module.exports = FileUploader;
