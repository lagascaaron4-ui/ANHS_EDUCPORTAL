// enrollment.js
// Handles backend draft autosave, basic client-side validation, file UI, and submit wiring
(function() {
    let currentDraftId = null;
    let saveTimer = null;
    // Optional client-side API key to authenticate draft requests when server requires it.
    // You may expose this via a small inline script in the page: window.__DRAFT_API_KEY__ = 'value';
    const CLIENT_DRAFT_API_KEY = (typeof window !== 'undefined' && window.__DRAFT_API_KEY__) ? window.__DRAFT_API_KEY__ : null;

    function qs(id) { return document.getElementById(id); }

    function showToast(msg, ms = 1800) {
        const t = qs('enrollToast');
        if (!t) return;
        t.textContent = msg;
        t.style.display = 'block';
        clearTimeout(t._hideTimeout);
        t._hideTimeout = setTimeout(() => t.style.display = 'none', ms);
    }

    // Inline error helpers
    function ensureErrorContainers() {
        const fields = ['lastName','firstName','middleName','extension','birthdate','age','gender','region','province','city','barangay','street','mobile','email','lrn','schoolName','gradeLevel','strand','consent'];
        fields.forEach(id => {
            const el = qs(id);
            if (!el) return;
            // if a dedicated error node already exists, skip
            const existing = document.getElementById('err-' + id);
            if (existing) return;
            // create a small div to hold inline error message
            const div = document.createElement('div');
            div.id = 'err-' + id;
            div.className = 'inline-error';
            div.setAttribute('aria-live', 'polite');
            div.style.color = '#b91c1c';
            div.style.fontSize = '0.9rem';
            div.style.marginTop = '6px';
            // Insert after the input/select element's parent if present, otherwise after element
            const parent = el.parentElement;
            if (parent) parent.appendChild(div);
            else el.insertAdjacentElement('afterend', div);
        });
    }

    function setFieldError(id, msg) {
        const node = document.getElementById('err-' + id);
        const el = qs(id);
        if (el) el.setAttribute('aria-invalid', 'true');
        if (node) node.textContent = msg || '';
    }

    function clearFieldError(id) {
        const node = document.getElementById('err-' + id);
        const el = qs(id);
        if (el) el.removeAttribute('aria-invalid');
        if (node) node.textContent = '';
    }

    function clearAllFieldErrors() {
        const els = document.querySelectorAll('.inline-error');
        els.forEach(n => n.textContent = '');
        const inputs = document.querySelectorAll('[aria-invalid]');
        inputs.forEach(i => i.removeAttribute('aria-invalid'));
    }

    function getFormDataObject() {
        const fields = ['lastName','firstName','middleName','extension','birthdate','age','gender','motherTongue','placeOfBirth','isIndigenous','ipCommunity','fourPsBeneficiary','fourPsIdNumber','hasDisability','disabilityType','disabilitySpecs','region','province','city','barangay','street','mobile','email','lrn','schoolName','gradeLevel','consent','psaBirthCertificateNo','fatherLastName','fatherFirstName','fatherMiddleName','fatherContact','motherMaidenName','motherFirstName','motherMiddleName','motherContact','guardianLastName','guardianFirstName','guardianMiddleName','guardianContact','isReturning','lastGradeCompleted','lastSchoolYearCompleted','lastSchoolAttended','lastSchoolId','semester','track','strand','parentGuardianName'];
        const obj = {};
        fields.forEach(id => {
            const el = qs(id);
            if (!el) return;
            if (el.type === 'checkbox') obj[id] = el.checked;
            else obj[id] = el.value || '';
        });
        // Handle radio buttons
        const radioFields = ['isIndigenous', 'fourPsBeneficiary', 'hasDisability', 'isReturning', 'enrollmentType'];
        radioFields.forEach(id => {
            const radios = document.querySelectorAll(`input[name="${id}"]`);
            radios.forEach(radio => {
                if (radio.checked) obj[id] = radio.value;
            });
        });
        // Handle checkboxes for preferred modalities
        const modalities = [];
        const modalityCheckboxes = document.querySelectorAll('input[name="preferredModalities"]:checked');
        modalityCheckboxes.forEach(cb => modalities.push(cb.value));
        obj.preferredModalities = modalities;
        // file names only (cannot store File objects)
        const fileInput = qs('fileInput');
        obj.files = fileInput ? Array.from(fileInput.files).map(f => f.name) : [];
        obj.timestamp = Date.now();
        return obj;
    }

    function saveDraftSoon() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            try {
                const o = getFormDataObject();
                showToast('Draft saved');
                // show draft banner
                const banner = qs('draftBanner');
                if (banner) banner.style.display = 'block';
                // Persist server-side (non-blocking)
                serverSaveDraft(o).catch(err => {
                    console.warn('Server draft save failed', err);
                });
            } catch (e) {
                console.error('Error saving draft', e);
            }
        }, 600);
    }

    // Server-side draft persistence
    async function serverSaveDraft(obj) {
        // create a payload; include _id if we have one
        const payload = Object.assign({}, obj);
        if (currentDraftId) payload._id = currentDraftId;

        const resp = await fetch('/api/enrollments/drafts', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, CLIENT_DRAFT_API_KEY ? { 'x-draft-key': CLIENT_DRAFT_API_KEY } : {}),
            body: JSON.stringify(payload),
        });
        if (!resp.ok) throw new Error('Failed to save draft server-side');
        const j = await resp.json();
        if (j && j.draftId) {
            currentDraftId = j.draftId;
        }
        return j;
    }

    // Upload current fileInput files to server for the saved draft
    async function uploadFilesToServer() {
        try {
            if (!currentDraftId) return;
            const input = qs('fileInput');
            if (!input || !input.files || input.files.length === 0) return;
            const fd = new FormData();
            Array.from(input.files).forEach(f => fd.append('documents', f));
            const headers = CLIENT_DRAFT_API_KEY ? { 'x-draft-key': CLIENT_DRAFT_API_KEY } : {};
            const resp = await fetch(`/api/enrollments/drafts/${currentDraftId}/files`, { method: 'POST', body: fd, headers });
            if (!resp.ok) throw new Error('upload failed');
            const j = await resp.json();
            console.log('Uploaded draft files', j.uploaded);
        } catch (err) {
            console.warn('Upload draft files failed', err);
        }
    }

    function clearDraft() {
        const previousDraftId = currentDraftId;
        currentDraftId = null;
        const banner = qs('draftBanner');
        if (banner) banner.style.display = 'none';
        showToast('Draft cleared');

        if (previousDraftId) {
            const headers = CLIENT_DRAFT_API_KEY ? { 'x-draft-key': CLIENT_DRAFT_API_KEY } : {};
            fetch(`/api/enrollments/drafts/${previousDraftId}`, { method: 'DELETE', headers }).catch(() => {});
        }
    }

    async function restoreDraft() {
        if (!currentDraftId) {
            showToast('No server draft found to restore.');
            return;
        }
        await fetchServerDraftAndPopulate(currentDraftId);
    }

    async function fetchServerDraftAndPopulate(id) {
        try {
            const resp = await fetch(`/api/enrollments/drafts/${id}`);
            if (!resp.ok) return;
            const j = await resp.json();
            if (!j || !j.draft) return;
            const o = j.draft.data || {};
            Object.keys(o).forEach(k => {
                const el = qs(k);
                if (!el) return;
                if (el.type === 'checkbox') el.checked = !!o[k];
                else el.value = o[k];
            });
            // Note: files are stored server-side; indicate presence to user via banner
            showToast('Server draft loaded. Please re-select files if needed.');
        } catch (e) { console.warn('Failed to fetch server draft', e); }
    }

    // File list UI using DataTransfer so we can remove items
    function renderFileItems() {
        const fileItems = qs('fileItems');
        const fileInput = qs('fileInput');
        if (!fileItems || !fileInput) return;
        fileItems.innerHTML = '';
        const files = Array.from(fileInput.files || []);
        files.forEach((file, idx) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `<span class="font-medium">${file.name}</span><button type="button" class="remove-file" data-idx="${idx}" aria-label="Remove file">×</button>`;
            fileItems.appendChild(div);
        });
        // Attach remove handlers
        fileItems.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const input = qs('fileInput');
                if (!input) return;
                const dt = new DataTransfer();
                Array.from(input.files).forEach((f, i) => { if (i !== idx) dt.items.add(f); });
                input.files = dt.files;
                renderFileItems();
                saveDraftSoon();
                // upload remaining files to server (non-blocking)
                uploadFilesToServer();
            });
        });
    }

    function initFileHandlers() {
        const browseBtn = qs('browseBtn');
        const fileInput = qs('fileInput');
        const dragArea = qs('dragArea');
        if (!fileInput) return;

        if (browseBtn) browseBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            renderFileItems();
            saveDraftSoon();
            uploadFilesToServer();
        });

        if (dragArea) {
            ['dragenter','dragover'].forEach(ev => dragArea.addEventListener(ev, e => { e.preventDefault(); dragArea.classList.add('active'); }));
            ['dragleave','drop'].forEach(ev => dragArea.addEventListener(ev, e => { e.preventDefault(); dragArea.classList.remove('active'); }));
            dragArea.addEventListener('drop', e => {
                const dt = e.dataTransfer;
                if (dt && dt.files && dt.files.length) {
                    const input = qs('fileInput');
                    const newDT = new DataTransfer();
                    // keep existing files
                    Array.from(input.files).forEach(f => newDT.items.add(f));
                    Array.from(dt.files).forEach(f => newDT.items.add(f));
                    input.files = newDT.files;
                    renderFileItems();
                    saveDraftSoon();
                    uploadFilesToServer();
                }
            });
        }
    }

    function validateForm() {
        clearAllFieldErrors();
        const required = ['lastName','firstName','birthdate','age','gender','motherTongue','placeOfBirth','region','province','city','barangay','mobile','lrn','schoolName','gradeLevel','consent'];
        for (const id of required) {
            const el = qs(id);
            if (!el) continue;
            if (el.type === 'checkbox') {
                if (!el.checked) {
                    setFieldError(id, 'This field is required.');
                    return { ok: false, message: 'Please accept the certification.', field: id };
                }
            } else if (!el.value || el.value.trim() === '') {
                setFieldError(id, 'This field is required.');
                const label = document.querySelector(`label[for="${id}"]`);
                return { ok: false, message: `${label ? label.textContent : id} is required.`, field: id };
            }
        }
        // Validate parent/guardian contact
        const hasFatherContact = qs('fatherContact') && qs('fatherContact').value.trim();
        const hasMotherContact = qs('motherContact') && qs('motherContact').value.trim();
        const hasGuardianContact = qs('guardianContact') && qs('guardianContact').value.trim();
        if (!hasFatherContact && !hasMotherContact && !hasGuardianContact) {
            setFieldError('fatherContact', 'At least one parent/guardian contact is required.');
            return { ok: false, message: 'At least one parent/guardian contact number is required.', field: 'fatherContact' };
        }
        // basic email check
        const email = qs('email');
        if (email && email.value) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(email.value)) {
                setFieldError('email', 'Please enter a valid email address.');
                return { ok: false, message: 'Please enter a valid email address.', field: 'email' };
            }
        }
        // basic mobile check (digits, 7-15)
        const mobile = qs('mobile');
        if (mobile && mobile.value) {
            const m = mobile.value.replace(/[^0-9+]/g,'');
            if (m.length < 7) {
                setFieldError('mobile', 'Please enter a valid mobile number.');
                return { ok: false, message: 'Please enter a valid mobile number.', field: 'mobile' };
            }
        }
        // Validate LRN format
        const lrn = qs('lrn');
        if (lrn && lrn.value) {
            if (!/^\d{12}$/.test(lrn.value)) {
                setFieldError('lrn', 'LRN must be exactly 12 digits.');
                return { ok: false, message: 'LRN must be exactly 12 digits.', field: 'lrn' };
            }
        }
        return { ok: true };
    }

    function wireForm() {
        const form = qs('enrollmentForm');
        const submitBtn = qs('submitBtn');
        const resetBtn = qs('resetBtn');
        const restoreBtn = qs('restoreDraft');
        const clearBtn = qs('clearDraft');

        if (!form) return;

        // Ensure inline error containers exist
        ensureErrorContainers();

        // Auto-save on input changes and clear field error for the changed field
        form.addEventListener('input', (e) => {
            const target = e.target;
            if (target && target.id) clearFieldError(target.id);
            saveDraftSoon();
        }, {capture: true});

        if (resetBtn) resetBtn.addEventListener('click', () => {
            // small delay to allow built-in reset to complete
            setTimeout(() => { renderFileItems(); clearDraft(); }, 50);
        });

        if (restoreBtn) restoreBtn.addEventListener('click', () => restoreDraft());
        if (clearBtn) clearBtn.addEventListener('click', () => clearDraft());

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const v = validateForm();
            if (!v.ok) { showToast(v.message, 3000); return; }

            if (submitBtn) {
                submitBtn.disabled = true;
                const original = submitBtn.textContent;
                submitBtn.textContent = 'Submitting...';
                showLoader();
                try {
                    const fd = new FormData();
                    const fields = ['lastName','firstName','middleName','extension','birthdate','age','gender','region','province','city','barangay','street','mobile','email','lrn','schoolName','gradeLevel','strand'];
                    fields.forEach(id => { const el = qs(id); if (el) fd.append(id, el.value); });
                    // files
                    const fileInput = qs('fileInput');
                    if (fileInput && fileInput.files) Array.from(fileInput.files).forEach(f => fd.append('documents', f));

                    // Submit enrollment directly without confirmation, as it will be pending admin approval
                    if (typeof submitEnrollment === 'function') {
                        const resp = await submitEnrollment(fd, true); // Always confirmed for submission
                        showToast(resp && resp.message ? resp.message : 'Enrollment submitted for admin approval', 3000);
                        form.reset();
                        renderFileItems();
                        // clear local draft and server draft if present
                        clearDraft();
                    } else {
                        // Define submitEnrollment function if not available
                        if (typeof submitEnrollment === 'undefined') {
                            submitEnrollment = async function(fd, confirmed = true) { // Default to true
                                try {
                                    // Get form data
                                    const formData = new FormData();
                                    const fields = ['lastName','firstName','middleName','extension','birthdate','age','gender','region','province','city','barangay','street','mobile','email','lrn','schoolName','gradeLevel','strand'];
                                    fields.forEach(id => {
                                        const el = qs(id);
                                        if (el) formData.append(id, el.value);
                                    });

                                    // Add files
                                    const fileInput = qs('fileInput');
                                    if (fileInput && fileInput.files) {
                                        Array.from(fileInput.files).forEach(f => formData.append('documents', f));
                                    }

                                    // Add confirmed flag
                                    formData.append('confirmed', confirmed);

                                    // Submit via API
                                    const result = await API.enrollments.create({
                                        studentData: {
                                            firstName: qs('firstName').value,
                                            lastName: qs('lastName').value,
                                            middleName: qs('middleName').value,
                                            extension: qs('extension').value,
                                            dateOfBirth: qs('birthdate').value,
                                            age: qs('age').value,
                                            gender: qs('gender').value,
                                            motherTongue: qs('motherTongue').value,
                                            placeOfBirth: qs('placeOfBirth').value,
                                            indigenousPeoples: {
                                                isIndigenous: qs('isIndigenous').value === 'yes',
                                                community: qs('ipCommunity').value
                                            },
                                            fourPsBeneficiary: qs('fourPsBeneficiary').value === 'yes',
                                            fourPsIdNumber: qs('fourPsIdNumber').value,
                                            disability: {
                                                hasDisability: qs('hasDisability').value === 'yes',
                                                type: qs('disabilityType').value,
                                                specifications: qs('disabilitySpecs').value
                                            },
                                            address: {
                                                street: qs('street').value,
                                                barangay: qs('barangay').value,
                                                municipality: qs('city').value,
                                                province: qs('province').value,
                                                zipCode: ''
                                            },
                                            contactNumber: qs('mobile').value,
                                            email: qs('email').value,
                                            lrn: qs('lrn').value,
                                            schoolName: qs('schoolName').value,
                                            gradeLevel: qs('gradeLevel').value,
                                            parents: {
                                                father: {
                                                    lastName: qs('fatherLastName').value,
                                                    firstName: qs('fatherFirstName').value,
                                                    middleName: qs('fatherMiddleName').value,
                                                    contactNumber: qs('fatherContact').value
                                                },
                                                mother: {
                                                    maidenName: qs('motherMaidenName').value,
                                                    firstName: qs('motherFirstName').value,
                                                    middleName: qs('motherMiddleName').value,
                                                    contactNumber: qs('motherContact').value
                                                },
                                                legalGuardian: {
                                                    lastName: qs('guardianLastName').value,
                                                    firstName: qs('guardianFirstName').value,
                                                    middleName: qs('guardianMiddleName').value,
                                                    contactNumber: qs('guardianContact').value
                                                }
                                            },
                                            psaBirthCertificateNo: qs('psaBirthCertificateNo').value,
                                            returningLearner: {
                                                isReturning: qs('isReturning').value === 'yes',
                                                lastGradeCompleted: qs('lastGradeCompleted').value,
                                                lastSchoolYearCompleted: qs('lastSchoolYearCompleted').value,
                                                lastSchoolAttended: qs('lastSchoolAttended').value,
                                                lastSchoolId: qs('lastSchoolId').value
                                            },
                                            seniorHighSchool: {
                                                semester: qs('semester').value,
                                                track: qs('track').value,
                                                strand: qs('strand').value
                                            },
                                            preferredLearningModalities: getFormDataObject().preferredModalities,
                                            parentEmail: qs('email').value
                                        },
                                        enrollmentData: {
                                            academicYear: new Date().getFullYear().toString(),
                                            semester: qs('semester').value || '1st Semester',
                                            preferredLearningModalities: getFormDataObject().preferredModalities
                                        },
                                        confirmed
                                    });

                                    if (result.success) {
                                        return { success: true, message: 'Enrollment submitted for admin approval!' };
                                    } else {
                                        throw new Error(result.message || 'Failed to submit enrollment');
                                    }
                                } catch (error) {
                                    console.error('Enrollment submission error:', error);
                                    throw error;
                                }
                            };
                        }

                        const resp = await submitEnrollment(fd, true);
                        showToast(resp && resp.message ? resp.message : 'Enrollment submitted for admin approval', 3000);
                        form.reset();
                        renderFileItems();
                        // clear local draft and server draft if present
                        clearDraft();
                    }
                } catch (err) {
                    console.error('Submit error', err);
                    showToast('Error submitting enrollment. Please try again.');
                } finally {
                    hideLoader();
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Enrollment'; }
                }
            }
        });
    }

    // Digital Signature functionality
    function initSignaturePad() {
        const canvas = qs('signatureCanvas');
        const clearBtn = qs('clearSignature');
        if (!canvas || !clearBtn) return;

        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas background to white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set canvas properties for better visibility
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.globalCompositeOperation = 'source-over';

        function getCanvasCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            if (e.touches && e.touches[0]) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            } else {
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            }
        }

        function startDrawing(e) {
            e.preventDefault();
            isDrawing = true;
            const coords = getCanvasCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const coords = getCanvasCoordinates(e);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            lastX = coords.x;
            lastY = coords.y;
        }

        function stopDrawing(e) {
            if (!isDrawing) return;
            e.preventDefault();
            isDrawing = false;
            ctx.beginPath();
            saveDraftSoon(); // Save draft when signature is drawn
        }

        // Mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        // Clear signature
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Re-fill background with white after clearing
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveDraftSoon();
        });
    }

    function getSignatureData() {
        const canvas = qs('signatureCanvas');
        if (!canvas) return null;

        // Check if canvas has any drawing
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check if all pixels are transparent (no drawing)
        let hasDrawing = false;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] > 0) { // alpha channel > 0
                hasDrawing = true;
                break;
            }
        }

        if (!hasDrawing) return null;

        return canvas.toDataURL('image/png');
    }

    // Auto-populate parent/guardian printed name
    function updatePrintedName() {
        const printedNameField = qs('parentGuardianName');
        if (!printedNameField) return;

        // Get parent/guardian names
        const fatherFirst = qs('fatherFirstName')?.value?.trim();
        const fatherLast = qs('fatherLastName')?.value?.trim();
        const motherFirst = qs('motherFirstName')?.value?.trim();
        const motherLast = qs('motherLastName')?.value?.trim();
        const guardianFirst = qs('guardianFirstName')?.value?.trim();
        const guardianLast = qs('guardianLastName')?.value?.trim();

        // Build full names
        const fatherFull = fatherFirst && fatherLast ? `${fatherFirst} ${fatherLast}` : '';
        const motherFull = motherFirst && motherLast ? `${motherFirst} ${motherLast}` : '';
        const guardianFull = guardianFirst && guardianLast ? `${guardianFirst} ${guardianLast}` : '';

        // Prioritize: Father > Mother > Guardian
        const printedName = fatherFull || motherFull || guardianFull || '';

        // Only update if field is empty or if it's different from current value
        if (!printedNameField.value || printedNameField.value !== printedName) {
            printedNameField.value = printedName;
        }
    }

    // On load
    document.addEventListener('DOMContentLoaded', async () => {
        // If a draft exists, show the banner
        try {
            if (currentDraftId) {
                // fetch server draft and populate fields
                await fetchServerDraftAndPopulate(currentDraftId);
                const banner = qs('draftBanner');
                if (banner) banner.style.display = 'block';
            }
        } catch (e) { console.error(e); }

        // Handle enrollment type radio buttons to show/hide returning learner section
        const enrollmentTypeRadios = document.querySelectorAll('input[name="enrollmentType"]');
        enrollmentTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const returningSection = qs('returningLearnerSection');
                if (returningSection) {
                    returningSection.style.display = this.value === 'returning' ? 'block' : 'none';
                }
            });
        });

        // Auto-update printed name when parent fields change
        const parentFields = ['fatherFirstName', 'fatherLastName', 'motherFirstName', 'motherLastName', 'guardianFirstName', 'guardianLastName'];
        parentFields.forEach(fieldId => {
            const field = qs(fieldId);
            if (field) {
                field.addEventListener('input', updatePrintedName);
            }
        });

        // Initial update of printed name
        updatePrintedName();

        initFileHandlers();
        renderFileItems();
        initSignaturePad();
        wireForm();
    });

})();
