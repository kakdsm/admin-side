// --- Global Quill Instance Variables ---
let quillInstanceJobOffer = null; // Renamed from quillInstance
let quillInstanceInitial = null;
let quillInstanceTechnical = null; // Renamed from quillInstanceFinal

// The ID of the container for Quill and the hidden textarea for the form
const quillContainerIdJobOffer = "quill-editor-job-offer"; // Renamed
const hiddenInputIdJobOffer = "job-offer-message-hidden"; // Renamed

// --- Constants for new modals ---
const quillContainerIdInitial = "quill-editor-initial-interview";
const hiddenInputIdInitial = "initial-interview-message-hidden";
const quillContainerIdTechnical = "quill-editor-technical-interview"; // Renamed
const hiddenInputIdTechnical = "technical-interview-message-hidden"; // Renamed

/**
 * Generates initials from a full name (used for avatars without an image).
 * @param {string} fullName - The full name of the user.
 * @returns {string} The capital initials (e.g., 'JS' for 'John Smith').
 */
function generateInitials(fullName) {
  if (!fullName) return "";
  const parts = fullName.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Toggles the action dropdown for a table row.
 * @param {HTMLElement} targetIcon - The icon that was clicked.
 */
function toggleActionDropdown(targetIcon) {
  const wrapper = targetIcon.closest(".action-dropdown-wrapper");
  if (!wrapper) return;

  const dropdown = wrapper.querySelector(".action-dropdown");
  if (!dropdown) return;

  // Close all other open dropdowns
  document.querySelectorAll(".action-dropdown").forEach((d) => {
    if (d !== dropdown) {
      d.style.display = "none";
    }
  });

  // Toggle the current dropdown
  const isVisible = dropdown.style.display === "block";
  dropdown.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    function closeOnOutsideClick(event) {
      if (!wrapper.contains(event.target)) {
        dropdown.style.display = "none";
        document.removeEventListener("click", closeOnOutsideClick);
      }
    }
    setTimeout(() => {
      document.addEventListener("click", closeOnOutsideClick);
    }, 0);
  }
}

/**
 * Helper function to calculate age.
 * @param {string} dateOfBirth - Date of birth in 'YYYY-MM-DD' format.
 * @returns {number|string} The calculated age or empty string if invalid/missing DOB.
 */
function calculateAge(dateOfBirth) {
  // Return empty string if DOB is null, empty, or '0000-00-00'
  if (!dateOfBirth || dateOfBirth === "0000-00-00") return "";
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Helper function to format date.
 * @param {string} dateString - Date string (e.g., 'YYYY-MM-DD').
 * @returns {string} Formatted date (e.g., 'Jan 1, 2023').
 */
function formatDate(dateString) {
  if (!dateString || dateString === "0000-00-00") return "N/A";
  const date = new Date(dateString + 'T00:00:00'); // Ensure it's treated as local date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Global function for User Profile Dropdown Toggle
function toggleDropdown() {
  const dropdown = document.getElementById("user-dropdown");
  const isVisible = dropdown.style.display === "block";
  dropdown.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    document.addEventListener(
      "click",
      function closeOnClick(event) {
        // Check if the click is outside the dropdown and the profile icon
        if (
          !event.target.closest(".user-profile") &&
          !event.target.closest("#user-dropdown")
        ) {
          dropdown.style.display = "none";
          document.removeEventListener("click", closeOnClick);
        }
      },
      { once: false }
    );
  }
}

/**
 * Handles the AJAX call to update applicant status.
 * NOTE: This function is legacy. All email/status updates are
 * now handled by the modal form submit listeners.
 */
async function updateApplicantStatus(appId, newStatus, linkElement) {
  console.warn(
    "Legacy updateApplicantStatus called. This should be handled by modal forms."
  );
}

// --- Selectors for ALL status modals ---
const jobOfferModal = document.getElementById("jobOfferModal"); // Renamed
const initialInterviewModal = document.getElementById("initialInterviewModal");
const technicalInterviewModal = document.getElementById(
  "technicalInterviewModal"
); // Renamed

// --- Close button selectors ---
const closeJobOfferModalBtn = document.getElementById("closeJobOfferModal"); // Renamed
const cancelJobOfferModalBtn = document.getElementById("cancelJobOfferModal"); // Renamed

// --- Form selectors ---
const jobOfferForm = document.getElementById("jobOfferForm"); // Renamed
const initialInterviewForm = document.getElementById("initialInterviewForm");
const technicalInterviewForm = document.getElementById(
  "technicalInterviewForm"
); // Renamed

/**
 * Closes the Job Offer/Email modal and resets the button.
 */
function closeJobOfferModal() {
  if (jobOfferModal) jobOfferModal.style.display = "none";
  const confirmBtn = document.getElementById("confirmJobOffer");
  if (confirmBtn) {
    confirmBtn.textContent = "Send Email & Mark for Job Offer"; // Modified text
    confirmBtn.disabled = false;
  }
}

/**
 * --- Closes the Initial Interview modal and resets the button. ---
 */
function closeInitialInterviewModal() {
  if (initialInterviewModal) initialInterviewModal.style.display = "none";
  const confirmBtn = initialInterviewForm?.querySelector(
    'button[type="submit"]'
  );
  if (confirmBtn) {
    confirmBtn.textContent = "Send Email & Move to Initial Interview";
    confirmBtn.disabled = false;
  }
}

/**
 * --- Closes the Technical Interview modal and resets the button. ---
 */
function closeTechnicalInterviewModal() {
  if (technicalInterviewModal) technicalInterviewModal.style.display = "none";
  const confirmBtn = technicalInterviewForm?.querySelector(
    'button[type="submit"]'
  );
  if (confirmBtn) {
    confirmBtn.textContent = "Send Email & Move to Technical Interview"; // Modified text
    confirmBtn.disabled = false;
  }
}

/**
 * Opens the Job Offer/Email modal with pre-populated data and template.
 * (This is for the 'Job Offer' / 'Hired' status)
 * @param {string} appId - Application ID.
 * @param {string} email - Applicant Email.
 * @param {string} fullName - Applicant Full Name.
 * @param {string} jobRole - Job Role.
 */
function openJobOfferModal(appId, email, fullName, jobRole) {
  const defaultSubject = `Good News! Job Offer for ${jobRole} Position in Philkoei International, Inc.`; // Modified subject

  // Set modal fields
  document.getElementById("appToJobOfferId").value = appId;
  document.getElementById("jobRoleToJobOffer").value = jobRole;
  document.getElementById("job-offer-recipient-email").value = email;
  document.getElementById("jobOfferApplicantFullName").textContent = fullName;
  document.getElementById("job-offer-subject").value = defaultSubject;

  // Email Template (User said to keep the email text the same)
  const emailTemplate = `
    <p>Dear ${fullName},</p>
    <p>Good day!</p>
    <p>Congratulations! We're happy to share that you've successfully passed the technical interview for the <strong>${jobRole}</strong> position.</p>
    <p>We'd love to invite you to a <strong>Job Offer Discussion</strong> via Zoom on <strong>[Date]</strong> at <strong>[Time]</strong>. This will be a great opportunity for us to talk about the next steps and what's ahead for you at Philkoei.</p>
    <p>Please confirm your availability for this schedule by replying to this email. Once confirmed, we'll send you the Zoom meeting credentials and a few details to help you prepare.</p>
    <p>We're excited to speak with you soon!</p>
    <p>Best regards,</p>
`;

  // Set Quill content
  if (quillInstanceJobOffer) {
    quillInstanceJobOffer.setContents([]);
    quillInstanceJobOffer.clipboard.dangerouslyPasteHTML(
      0,
      emailTemplate,
      "silent"
    );
    document.getElementById(hiddenInputIdJobOffer).value =
      quillInstanceJobOffer.root.innerHTML;
  }

  jobOfferModal.style.display = "flex";
}

/**
 * --- Opens the Initial Interview modal. ---
 * @param {string} appId - Application ID.
 * @param {string} email - Applicant Email.
 * @param {string} fullName - Applicant Full Name.
 * @param {string} jobRole - Job Role.
 */
function openInitialInterviewModal(appId, email, fullName, jobRole) {
  const defaultSubject = `Good News! Next Step (Initial Interview) for Your Application for ${jobRole} Position.`;

  // Set modal fields
  document.getElementById("appToInitialInterviewId").value = appId;
  document.getElementById("jobRoleToInitialInterview").value = jobRole;
  document.getElementById("initial-interview-recipient-email").value = email;
  document.querySelector(
    'strong[data-full-name="initialInterview"]'
  ).textContent = fullName;
  document.getElementById("initial-interview-subject").value = defaultSubject;

  // Email Template (User said to keep the email text the same)
  const emailTemplate = `
        <p>Dear ${fullName},</p>
        <p>Good day!</p>
        <p>Thank you for your interest in applying for the <strong>${jobRole}</strong> position at Philkoei International. After reviewing your CV, we're pleased to invite you to a screening interview.</p>
        <p>To help us learn more about your background and assess your competencies, kindly choose your preferred interview schedule via the link below:</p>
        <p><a href="https://calendly.com/careers-philkoei/screening-interview" target="_blank">https://calendly.com/careers-philkoei/screening-interview</a></p>
        <p>You will receive a confirmation email containing the interview details after scheduling.</p>
        <p>Thank you, and we look forward to meeting you soon!</p>
        <p>Best regards,</p>
    `;

  // Set Quill content
  if (quillInstanceInitial) {
    quillInstanceInitial.setContents([]);
    quillInstanceInitial.clipboard.dangerouslyPasteHTML(
      0,
      emailTemplate,
      "silent"
    );
    document.getElementById(hiddenInputIdInitial).value =
      quillInstanceInitial.root.innerHTML;
  }

  initialInterviewModal.style.display = "flex";
}

/**
 * --- Opens the Technical Interview modal. ---
 * @param {string} appId - Application ID.
 * @param {string} email - Applicant Email.
 * @param {string} fullName - Applicant Full Name.
 * @param {string} jobRole - Job Role.
 */
function openTechnicalInterviewModal(appId, email, fullName, jobRole) {
  const defaultSubject = `Good News! Next Step (Technical Interview) for Your Application for ${jobRole} Position.`; // Modified subject

  // Set modal fields
  document.getElementById("appToTechnicalInterviewId").value = appId;
  document.getElementById("jobRoleToTechnicalInterview").value = jobRole;
  document.getElementById("technical-interview-recipient-email").value = email;
  document.querySelector(
    'strong[data-full-name="technicalInterview"]'
  ).textContent = fullName;
  document.getElementById("technical-interview-subject").value = defaultSubject;

  // Email Template (User said to keep the email text the same)
  const emailTemplate = `
        <p>Dear ${fullName},</p>
        <p>Good day!</p>
        <p>Great news! You've successfully passed the initial screening for the <strong>${jobRole}</strong> position at Philkoei International.</p>
        <p>We'd love to invite you to the next step of the process: a <strong>Technical Interview</strong>, which will be held onsite on <strong>[Date]</strong> at <strong>[Time]</strong>. This will be a great opportunity for us to get to know you better and learn more about your skills and experiences.</p>
        <p>Kindly confirm your availability for the schedule by replying to this email. Once we receive your confirmation, we'll send another email with the reminders and details.</p>
        <p>Thank you, and we look forward to seeing you soon!</p>
        <p>Best regards,</p>
    `;

  // Set Quill content
  if (quillInstanceTechnical) {
    quillInstanceTechnical.setContents([]);
    quillInstanceTechnical.clipboard.dangerouslyPasteHTML(
      0,
      emailTemplate,
      "silent"
    );
    document.getElementById(hiddenInputIdTechnical).value =
      quillInstanceTechnical.root.innerHTML;
  }

  technicalInterviewModal.style.display = "flex";
}

/**
 * Initializes the Quill editor for the Job Offer modal.
 */
function initializeQuillEditorJobOffer() {
  if (!document.querySelector(`#${quillContainerIdJobOffer}`)) return;

  const toolbarOptions = [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ];

  quillInstanceJobOffer = new Quill(`#${quillContainerIdJobOffer}`, {
    modules: { toolbar: toolbarOptions },
    theme: "snow",
  });

  quillInstanceJobOffer.on("text-change", function () {
    document.getElementById(hiddenInputIdJobOffer).value =
      quillInstanceJobOffer.root.innerHTML;
  });
}

/**
 * --- Initializes the Quill editor for the Initial Interview modal. ---
 */
function initializeQuillEditorInitial() {
  if (!document.querySelector(`#${quillContainerIdInitial}`)) return;

  const toolbarOptions = [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ];

  quillInstanceInitial = new Quill(`#${quillContainerIdInitial}`, {
    modules: { toolbar: toolbarOptions },
    theme: "snow",
  });

  quillInstanceInitial.on("text-change", function () {
    document.getElementById(hiddenInputIdInitial).value =
      quillInstanceInitial.root.innerHTML;
  });
}

/**
 * --- Initializes the Quill editor for the Technical Interview modal. ---
 */
function initializeQuillEditorTechnical() {
  if (!document.querySelector(`#${quillContainerIdTechnical}`)) return;

  const toolbarOptions = [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ];

  quillInstanceTechnical = new Quill(`#${quillContainerIdTechnical}`, {
    modules: { toolbar: toolbarOptions },
    theme: "snow",
  });

  quillInstanceTechnical.on("text-change", function () {
    document.getElementById(hiddenInputIdTechnical).value =
      quillInstanceTechnical.root.innerHTML;
  });
}

/**
 * --- Generic AJAX handler for all status email forms ---
 * (Job Offer, Initial Interview, Technical Interview)
 */
async function handleStatusEmailFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const newStatus = form.querySelector('input[name="newStatus"]').value;
  const confirmBtn = form.querySelector('button[type="submit"]');
  if (!confirmBtn) return;

  let originalButtonText = confirmBtn.textContent;

  // Get data from form
  const appId = form.querySelector('input[name="appid"]').value;
  const subject = form.querySelector('input[name="subject"]').value.trim();
  const customMessage = form.querySelector(
    'textarea[name="customMessage"]'
  ).value;

  if (
    !subject ||
    !customMessage ||
    customMessage.trim() === "<p><br></p>" ||
    customMessage.trim() === ""
  ) {
    alert("Subject and Email Message cannot be empty."); // Error alerts are OK
    return;
  }

  confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  confirmBtn.disabled = true;

  const formData = new FormData(form);

  try {
    const response = await fetch("update_applicant_status.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      // alert(result.message); // <-- MODIFIED: REMOVED!
      window.location.reload(); // <-- MODIFIED: ADDED! This will reload the page to show the custom alert.
    } else {
      alert("Failed to update status: " + result.message); // Error alerts are OK
      confirmBtn.textContent = originalButtonText; // Reset button if failed
      confirmBtn.disabled = false;
    }
  } catch (error) {
    console.error("AJAX Error:", error);
    alert(
      "An unexpected error occurred while sending the email and updating the status."
    ); // Error alerts are OK
    confirmBtn.textContent = originalButtonText; // Reset button if failed
    confirmBtn.disabled = false;
  }
}

/**
 * Populates the applicant profile modal with data.
 * @param {object} applicantData - The applicant's data object from the API.
 */
function populateApplicantModal(applicantData) {
  console.log("Populating modal with job fit data:", applicantData);

  // Get the current job role from the hidden input
  // Note: currentViewingJobRole is globally defined in applicants.php
  const currentJobRole =
    document.getElementById("currentViewingJobRole")?.value || "this job";

  // Personal Information
  document.getElementById("viewUserId").value = applicantData.user_id || "N/A";
  document.getElementById("viewFullName").value = applicantData.name || "N/A";

  // Handle birthday and age
  const birthday =
    applicantData.birthday && applicantData.birthday !== "0000-00-00"
      ? applicantData.birthday
      : "Not set";
  document.getElementById("viewDOB").value = birthday;

  const age =
    applicantData.age || (birthday !== "Not set" ? calculateAge(birthday) : "N/A");
  document.getElementById("viewAge").value = age;

  // Contact Information
  document.getElementById("viewEmail").value = applicantData.email || "N/A";
  document.getElementById("viewContact").value =
    applicantData.contact || "Not set";

  // Educational Background
  document.getElementById("viewEduLvl").value =
    applicantData.education_level || "Not set";
  document.getElementById("viewCourse").value =
    applicantData.course || "Not set";
  document.getElementById("viewSchool").value =
    applicantData.school || "Not set";

  // System Information
  const joinDate = applicantData.date_applied
    ? formatDate(applicantData.date_applied)
    : "N/A";
  document.getElementById("viewSignupDate").value = joinDate;

  // JOB FIT TEST SCORE Section - DYNAMIC JOB ROLE
  const roleMatchField = document.getElementById("rolematch");
  const rolePercentageField = document.getElementById("rolepercentage");

  // RESET ALL STYLING FIRST
  if (roleMatchField) {
    roleMatchField.style.backgroundColor = "";
    roleMatchField.style.borderLeft = "";
    roleMatchField.style.color = "";
  }
  if (rolePercentageField) {
    rolePercentageField.style.backgroundColor = "";
    rolePercentageField.style.borderLeft = "";
    rolePercentageField.style.color = "";
  }

  if (applicantData.is_match && applicantData.match_percentage > 0) {
    // HAS MATCH - Show positive styling
    roleMatchField.value = `${currentJobRole}`;
    rolePercentageField.value = `${applicantData.match_percentage}% Match Score`;

    // Add visual styling - YELLOW for matches
    roleMatchField.style.backgroundColor = "#fffbeb";
    roleMatchField.style.borderLeft = "4px solid #f59e0b";
    rolePercentageField.style.backgroundColor = "#fffbeb";
    rolePercentageField.style.borderLeft = "4px solid #f59e0b";
  } else {
    // NO MATCH - Highlight in RED
    roleMatchField.value = `No match for ${currentJobRole}`;
    rolePercentageField.value = "N/A";

    // RED highlighting for no match
    roleMatchField.style.backgroundColor = "#fee2e2";
    roleMatchField.style.borderLeft = "4px solid #ef4444";
    roleMatchField.style.color = "#dc2626";
    rolePercentageField.style.backgroundColor = "#fee2e2";
    rolePercentageField.style.borderLeft = "4px solid #ef4444";
    rolePercentageField.style.color = "#dc2626";
  }

  // Update profile summary
  document.getElementById("profileFullName").textContent =
    applicantData.name || "N/A";
  document.getElementById("profileEmailSummary").textContent =
    applicantData.email || "N/A";

  // Update profile status - DYNAMIC JOB ROLE
  const profileStatus = document.getElementById("profileStatus");
  if (applicantData.is_match && applicantData.match_percentage > 0) {
    profileStatus.innerHTML = `<span style="color: #10b981; font-weight: bold;">
            <i class="fas fa-star"></i> ${currentJobRole} Match: ${applicantData.match_percentage}% 
        </span>`;
  } else {
    profileStatus.innerHTML = `<span style="color: #ef4444; font-weight: bold;">
            <i class="fas fa-times-circle"></i> No match for ${currentJobRole}
        </span>`;
  }

  // Update avatar
  const profileAvatar = document.getElementById("profileAvatar");
  profileAvatar.innerHTML = "";

  if (applicantData.avatar) {
    // Use base64 avatar from API response
    const img = document.createElement("img");
    img.src = applicantData.avatar; // This should be the full data URI
    img.alt = "User Avatar";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.borderRadius = "50%";
    img.style.objectFit = "cover";
    profileAvatar.appendChild(img);
  } else {
    // Fallback to initials
    const initials = applicantData.first_name
      ? applicantData.first_name.charAt(0).toUpperCase()
      : "U";
    profileAvatar.textContent = initials;
    profileAvatar.style.backgroundColor = "#2f80ed";
    profileAvatar.style.display = "flex";
    profileAvatar.style.alignItems = "center";
    profileAvatar.style.justifyContent = "center";
    profileAvatar.style.color = "white";
    profileAvatar.style.fontWeight = "bold";
    profileAvatar.style.fontSize = "24px";
  }
}

// ======================================================================
// 3. MAIN DOM CONTENT LOADED INITIALIZATION 🚀
// ======================================================================

document.addEventListener("DOMContentLoaded", function () {
  // --- 3.1. DOM Element Selectors ---

  // Modals
  const logoutModal = document.getElementById("logoutModal");
  const viewUserProfileModal = document.getElementById("viewUserProfileModal");
  const adminProfileModal = document.getElementById("adminUserProfileModal");
  const nullFieldInstruction = document.getElementById("nullFieldInstruction"); // Instruction for null fields
  const archiveApplicantModal = document.getElementById(
    "archiveApplicantModal"
  );
  const rejectApplicantModal = document.getElementById("rejectApplicantModal");

  // (Selectors for status modals are now global)

  // Buttons/Toggles
  const cancelLogout = document.getElementById("cancelLogout");
  const logoutBtnSidebar = document.getElementById("logoutBtn");
  const logoutBtnDropdown = document.getElementById("logoutDropdownBtn");
  const burger = document.querySelector(".burger");
  const sidebar = document.querySelector(".sidebar");
  const closeUserProfileModalBtn = document.getElementById(
    "closeUserProfileModal"
  ); // Applicant View Modal close X
  const profileModalCloseBtn = document.getElementById("profileModalCloseBtn"); // Applicant View Modal close button
  const viewProfileModalBtn = document.getElementById("viewProfileModalBtn"); // Open Admin Profile Modal
  const closeAdminUserProfileModal = document.getElementById(
    "closeAdminUserProfileModal"
  ); // Admin Profile Modal close X
  const adminProfileModalCloseBtn = document.getElementById(
    "adminProfileModalCloseBtn"
  ); // Admin Profile Modal close button (Cancel/Close)
  const editProfileBtn = document.getElementById("editProfileBtn");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const adminImageInput = document.getElementById("adminImageInput");
  const applicantsTable = document.getElementById("applicantsTable");
  const cancelArchiveApplicantBtn = document.getElementById(
    "cancelArchiveApplicant"
  );
  const confirmArchiveApplicantBtn = document.getElementById(
    "confirmArchiveApplicant"
  );
  const archiveApplicantFullNameSpan = document.getElementById(
    "archiveApplicantFullName"
  );
  const archiveApplicantAppIdSpan = document.getElementById(
    "archiveApplicantAppId"
  );
  const appToArchiveIdInput = document.getElementById("appToArchiveId");
  const cancelRejectApplicantBtn = document.getElementById(
    "cancelRejectApplicant"
  );
  const confirmRejectApplicantBtn = document.getElementById(
    "confirmRejectApplicant"
  );
  const rejectionReasonSelect = document.getElementById(
    "rejectionReasonSelect"
  );
  const otherReasonField = document.getElementById("otherReasonField");
  const otherReasonText = document.getElementById("otherReasonText");
  const appToRejectIdInput = document.getElementById("appToRejectId");
  const userToRejectEmailInput = document.getElementById("userToRejectEmail"); // Not strictly needed, but useful for context
  const userToRejectNameInput = document.getElementById("userToRejectName"); // Not strictly needed, but useful for context
  const rejectApplicantFullNameSpan = document.getElementById(
    "rejectApplicantFullName"
  );
  const rejectApplicantAppIdSpan = document.getElementById(
    "rejectApplicantAppId"
  );
  const currentViewingJobRoleInput = document.getElementById(
    "currentViewingJobRole"
  );

  // Table Controls
  const applicantSearch = document.getElementById("applicantSearch");
  const applicantStatusFilter = document.getElementById(
    "applicantStatusFilter"
  );
  const applicantSortOrder = document.getElementById("applicantSortOrder");
  const applicantDateRange = document.getElementById("applicantDateRange"); // *** NEW ***
  const applicantRowsPerPage = document.getElementById("applicantRowsPerPage");
  const applicantTableBody = document.querySelector("#applicantsTable tbody");
  const applicantPaginationInfo = document.getElementById(
    "applicantPaginationInfo"
  );
  const applicantPrevPage = document.getElementById("applicantPrevPage");
  const applicantNextPage = document.getElementById("applicantNextPage");
  const applicantPageNumbers = document.getElementById("applicantPageNumbers");

  // Admin Profile Fields/Summary Elements
  const profileFields = {
    adminName: document.getElementById("viewAdminFullName"),
    adminEmail: document.getElementById("viewAdminEmail"),
  };
  const profileSummaryElements = {
    profileFullNameModal: document.getElementById("profileFullNameModal"),
    profileEmailSummaryModal: document.getElementById(
      "profileEmailSummaryModal"
    ),
    profileAvatarModal: document.getElementById("profileAvatarModal"),
  };

  // Admin Profile State Variables
  let isEditing = false;
  let originalAdminName = profileFields.adminName?.value || "";
  let originalAdminEmail = profileFields.adminEmail?.value || "";
  let originalAdminImageBase64 =
    document.getElementById("originalAdminImageBase64")?.value || "";
  let tempAdminImageFile = null;

  // --- 3.2. Core Utility Functions (Admin Profile & Modals) ---

  /**
   * Toggles the readOnly state of admin profile fields and button visibility.
   * @param {boolean} enable - True to enable editing, false to disable.
   */
  function toggleEditMode(enable) {
    isEditing = enable;
    if (profileFields.adminName) profileFields.adminName.readOnly = !enable;
    if (profileFields.adminEmail) profileFields.adminEmail.readOnly = !enable;

    if (editProfileBtn)
      editProfileBtn.style.display = enable ? "none" : "inline-block";
    if (saveProfileBtn)
      saveProfileBtn.style.display = enable ? "inline-block" : "none";
    if (changePhotoBtn)
      changePhotoBtn.style.display = enable ? "inline-block" : "none";

    if (adminProfileModalCloseBtn)
      adminProfileModalCloseBtn.textContent = enable ? "Cancel" : "Close";

    if (profileFields.adminName)
      profileFields.adminName.classList.toggle("editable-field", enable);
    if (profileFields.adminEmail)
      profileFields.adminEmail.classList.toggle("editable-field", enable);
  }

  /**
   * Restores the original image/initials in the modal and main profile area.
   */
  function restoreOriginalImageInModal() {
    const avatarElement = profileSummaryElements.profileAvatarModal;
    const mainAvatarElement = document.querySelector(
      ".user-profile .avatar-circle"
    );

    const updateAvatar = (element, sizeClass) => {
      if (!element) return;
      // First, remove existing image/initials
      if (element.tagName === "IMG") {
        const tempDiv = document.createElement("div");
        element.replaceWith(tempDiv);
        element = tempDiv;
      }
      element.innerHTML = "";
      element.className = sizeClass;

      if (originalAdminImageBase64) {
        const imgElement = document.createElement("img");
        imgElement.src = originalAdminImageBase64;
        imgElement.alt = "Admin Avatar";
        imgElement.classList.add(sizeClass);
        element.replaceWith(imgElement);
        return imgElement;
      } else {
        element.classList.add(sizeClass);
        element.textContent = generateInitials(originalAdminName);
        return element;
      }
    };

    if (avatarElement) {
      profileSummaryElements.profileAvatarModal = updateAvatar(
        avatarElement,
        "avatar-circle-large"
      );
    }
    if (mainAvatarElement) {
      updateAvatar(mainAvatarElement, "avatar-circle");
    }
  }

  /**
   * Common function to close the Admin Profile modal, handling edit state cleanup.
   */
  const closeAdminProfile = () => {
    if (adminProfileModal.style.display === "flex" && isEditing) {
      if (profileFields.adminName)
        profileFields.adminName.value = originalAdminName;
      if (profileFields.adminEmail)
        profileFields.adminEmail.value = originalAdminEmail;
      restoreOriginalImageInModal();
      tempAdminImageFile = null;
    }
    if (adminProfileModal) adminProfileModal.style.display = "none";
    toggleEditMode(false);
  };

  function closeRejectModal() {
    if (rejectApplicantModal) rejectApplicantModal.style.display = "none";
    if (rejectionReasonSelect) rejectionReasonSelect.value = "";
    if (otherReasonText) otherReasonText.value = "";
    if (otherReasonField) otherReasonField.style.display = "none";
    if (confirmRejectApplicantBtn) {
      confirmRejectApplicantBtn.textContent = "Save";
      confirmRejectApplicantBtn.disabled = false;
    }
  }

  function openRejectModal(appId, name, email) {
    if (rejectApplicantModal) rejectApplicantModal.style.display = "flex";
    if (rejectApplicantFullNameSpan)
      rejectApplicantFullNameSpan.textContent = name;
    if (rejectApplicantAppIdSpan) rejectApplicantAppIdSpan.textContent = appId;
    if (appToRejectIdInput) appToRejectIdInput.value = appId;
    if (userToRejectEmailInput) userToRejectEmailInput.value = email;
    if (userToRejectNameInput) userToRejectNameInput.value = name;
  }

  // --- 3.3. Initializers and Core Logic ---

  // Initialize ALL Quill Editors
  initializeQuillEditorJobOffer(); // Renamed
  initializeQuillEditorInitial();
  initializeQuillEditorTechnical(); // Renamed

  // --- 3.4. Event Listeners ---

  // --- Logout Modal Handlers ---
  const openLogoutModal = (e) => {
    e.preventDefault();
    if (logoutModal) logoutModal.style.display = "flex";
  };

  logoutBtnSidebar?.addEventListener("click", openLogoutModal);
  logoutBtnDropdown?.addEventListener("click", openLogoutModal);

  cancelLogout?.addEventListener("click", function () {
    if (logoutModal) logoutModal.style.display = "none";
  });

  // --- Sidebar Toggle ---
  burger?.addEventListener("click", () => {
    sidebar?.classList.toggle("active");
    burger.classList.toggle("active");
  });

  // --- View Applicant Modal Closing Logic (Re-used) ---
  const closeApplicantModal = () => {
    if (viewUserProfileModal) viewUserProfileModal.style.display = "none";
  };

  closeUserProfileModalBtn?.addEventListener("click", closeApplicantModal);
  profileModalCloseBtn?.addEventListener("click", closeApplicantModal);

  // Close when clicking outside the applicant modal content
  window.addEventListener("click", function (event) {
    if (event.target == viewUserProfileModal) {
      closeApplicantModal();
    }
  });

  // --- Admin Profile Modal Handlers ---
  viewProfileModalBtn?.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("user-dropdown").style.display = "none";
    originalAdminName = profileFields.adminName.value;
    originalAdminEmail = profileFields.adminEmail.value;
    originalAdminImageBase64 = document.getElementById(
      "originalAdminImageBase64"
    ).value;
    tempAdminImageFile = null;
    restoreOriginalImageInModal();
    toggleEditMode(false);
    if (adminProfileModal) adminProfileModal.style.display = "flex";
  });

  closeAdminUserProfileModal?.addEventListener("click", closeAdminProfile);
  adminProfileModalCloseBtn?.addEventListener("click", closeAdminProfile);

  editProfileBtn?.addEventListener("click", function () {
    toggleEditMode(true);
  });

  saveProfileBtn?.addEventListener("click", async function () {
    const newAdminName = profileFields.adminName.value.trim();
    const newAdminEmail = profileFields.adminEmail.value.trim();

    if (!newAdminName || !newAdminEmail) {
      alert("Full Name and Email Address cannot be empty."); // Error alerts are OK
      return;
    }
    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(newAdminEmail)) {
      alert("Please enter a valid email address."); // Error alerts are OK
      return;
    }

    const formData = new FormData();
    formData.append("adminname", newAdminName);
    formData.append("adminemail", newAdminEmail);

    if (tempAdminImageFile) {
      formData.append("adminImage", tempAdminImageFile);
    } else if (originalAdminImageBase64 === "") {
      formData.append("adminImage", "");
    }

    try {
      const response = await fetch("update_admin_profile.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        window.location.reload();
      } else {
        alert("Error: " + data.message); // Error alerts are OK
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile."); // Error alerts are OK
    }
  });

  changePhotoBtn?.addEventListener("click", function () {
    if (adminImageInput) adminImageInput.click();
  });

  adminImageInput?.addEventListener("change", function () {
    if (this.files.length > 0) {
      tempAdminImageFile = this.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        let avatarElement = profileSummaryElements.profileAvatarModal;
        if (!avatarElement) return;
        if (avatarElement.tagName === "DIV") {
          const imgElement = document.createElement("img");
          imgElement.src = e.target.result;
          imgElement.alt = "Admin Avatar";
          imgElement.classList.add("avatar-circle-large");
          avatarElement.replaceWith(imgElement);
          profileSummaryElements.profileAvatarModal = imgElement;
        } else {
          avatarElement.src = e.target.result;
        }
      };
      reader.readAsDataURL(tempAdminImageFile);
    }
  });

  // --- Applicants Table Universal Listener (UPDATED) ---
  applicantsTable?.addEventListener("click", function (e) {
    // Listener for the Status Dropdown Icon
    const dropdownToggle = e.target.closest(".status-dropdown-toggle");
    if (dropdownToggle) {
      e.preventDefault();
      e.stopPropagation();
      toggleActionDropdown(dropdownToggle);
    }

    // Listener for the View Applicant Icon
    const viewApplicantIcon = e.target.closest(".view-applicant");
    if (viewApplicantIcon) {
      e.preventDefault();
      e.stopImmediatePropagation(); // Stop other listeners

      const row = viewApplicantIcon.closest("tr");
      const applicantDataJson = row.getAttribute("data-applicant-data");

      if (applicantDataJson) {
        try {
          // Replace escaped quotes if necessary
          const applicantData = JSON.parse(
            applicantDataJson.replace(/&#39;/g, "'")
          );
          populateApplicantModal(applicantData);
          if (viewUserProfileModal) viewUserProfileModal.style.display = "flex";
        } catch (parseError) {
          console.error("Error parsing applicant data:", parseError);
          alert("Error loading applicant data.");
        }
      } else {
        console.error("No applicant data found in data-applicant-data attribute.");
        alert("Could not load applicant data. Attribute missing.");
      }
    }

    // --- UPDATED: Handler for 'Job Offer' and 'Failed' ---
    if (e.target.classList.contains("update-applicant-status")) {
      e.preventDefault();
      const linkElement = e.target;
      const appId = linkElement.getAttribute("data-appid");
      const newStatus = linkElement.getAttribute("data-new-status");

      const dropdown = linkElement.closest(".action-dropdown");
      if (dropdown) dropdown.style.display = "none";

      const row = linkElement.closest("tr");
      const applicantData = JSON.parse(
        row.getAttribute("data-applicant-data").replace(/&#39;/g, "'")
      );
      const name = applicantData.name;
      const email = applicantData.email;
      const jobRole = currentViewingJobRoleInput.value;

      if (newStatus === "Job Offer") {
        openJobOfferModal(appId, email, name, jobRole);
      } else if (newStatus === "Failed") {
        openRejectModal(appId, name, email);
      }
    }

    // --- NEW: Handler for 'Initial Interview' and 'Technical Interview' ---
    const statusModalLink = e.target.closest(".open-status-modal");
    if (statusModalLink) {
      e.preventDefault();
      const linkElement = statusModalLink;
      const appId = linkElement.getAttribute("data-appid");
      const newStatus = linkElement.getAttribute("data-new-status");
      const name = linkElement.getAttribute("data-name");
      const email = linkElement.getAttribute("data-email");

      const dropdown = linkElement.closest(".action-dropdown");
      if (dropdown) dropdown.style.display = "none";

      const jobRole = currentViewingJobRoleInput.value;

      if (newStatus === "Initial Interview") {
        openInitialInterviewModal(appId, email, name, jobRole);
      } else if (newStatus === "Technical Interview") {
        openTechnicalInterviewModal(appId, email, name, jobRole);
      }
    }

    // Listener for the Archive Applicant Icon
    const archiveApplicantIcon = e.target.closest(".archive-applicant");
    if (archiveApplicantIcon) {
      e.preventDefault();
      const appId = archiveApplicantIcon.getAttribute("data-appid");
      const row = archiveApplicantIcon.closest("tr");
      if (!appId || !row) {
        alert("Error: Application ID or table row not found.");
        return;
      }

      const applicantData = JSON.parse(
        row.getAttribute("data-applicant-data").replace(/&#39;/g, "'")
      );
      const fullName = applicantData.name;

      if (archiveApplicantFullNameSpan)
        archiveApplicantFullNameSpan.textContent = fullName;
      if (archiveApplicantAppIdSpan)
        archiveApplicantAppIdSpan.textContent = appId;
      if (appToArchiveIdInput) appToArchiveIdInput.value = appId;
      if (archiveApplicantModal) archiveApplicantModal.style.display = "flex";
    }
  });

  // --- Archive Applicant Modal Handlers ---
  const closeArchiveModal = () => {
    if (archiveApplicantModal) archiveApplicantModal.style.display = "none";
  };

  cancelArchiveApplicantBtn?.addEventListener("click", closeArchiveModal);

  window.addEventListener("click", function (event) {
    if (event.target == archiveApplicantModal) {
      closeArchiveModal();
    }
  });

  confirmArchiveApplicantBtn?.addEventListener("click", async function () {
    const appId = appToArchiveIdInput.value;
    if (!appId) {
      alert("Error: Application ID not found."); // Error alerts are OK
      return;
    }
    const formData = new FormData();
    formData.append("appid", appId);

    try {
      const response = await fetch("archive_applicant.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        // alert(`Application ID ${appId} archived successfully!`); // <-- MODIFIED: REMOVED!
        window.location.reload(); // <-- MODIFIED: ADDED!
      } else {
        alert("Failed to archive application: " + result.message); // Error alerts are OK
      }
    } catch (error) {
      console.error("AJAX Error:", error);
      alert("An unexpected error occurred during the archive process."); // Error alerts are OK
    }
  });

  // --- Universal Keydown and Click Outside Handlers (UPDATED) ---

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (logoutModal) logoutModal.style.display = "none";
      closeApplicantModal();
      closeAdminProfile();
      closeRejectModal();
      closeJobOfferModal(); // MODIFIED
      closeInitialInterviewModal();
      closeTechnicalInterviewModal(); // MODIFIED
      const userDropdown = document.getElementById("user-dropdown");
      if (userDropdown) userDropdown.style.display = "none";
    }
  });

  window.addEventListener("click", function (event) {
    if (event.target == adminProfileModal) {
      closeAdminProfile();
    }
    if (event.target == rejectApplicantModal) {
      closeRejectModal();
    }
    // Updated to include all status modals
    if (event.target == jobOfferModal) {
      // MODIFIED
      closeJobOfferModal(); // MODIFIED
    }
    if (event.target == initialInterviewModal) {
      closeInitialInterviewModal();
    }
    if (event.target == technicalInterviewModal) {
      // MODIFIED
      closeTechnicalInterviewModal(); // MODIFIED
    }
  });

  // --- Event Listeners for Rejection Modal ---
  rejectionReasonSelect?.addEventListener("change", function () {
    if (this.value === "Other reason") {
      otherReasonField.style.display = "block";
      otherReasonText.setAttribute("required", "required");
    } else {
      otherReasonField.style.display = "none";
      otherReasonText.removeAttribute("required");
    }
  });

  cancelRejectApplicantBtn?.addEventListener("click", closeRejectModal);

  confirmRejectApplicantBtn?.addEventListener("click", async function () {
    const appId = appToRejectIdInput.value;
    const newStatus = "Failed"; // *** MODIFIED: Status is now 'Failed' ***
    const rejectionReason = rejectionReasonSelect.value;
    let otherReasonDetail = otherReasonText.value.trim();

    if (!rejectionReason || rejectionReason === "") {
      alert("Please select a rejection reason."); // Error alerts are OK
      return;
    }
    if (rejectionReason === "Other reason" && !otherReasonDetail) {
      alert('Please provide details for the "Other reason".'); // Error alerts are OK
      return;
    }

    const finalReason =
      rejectionReason === "Other reason"
        ? `Other reason: ${otherReasonDetail}`
        : rejectionReason;

    confirmRejectApplicantBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Saving...';
    confirmRejectApplicantBtn.disabled = true;

    const formData = new FormData();
    formData.append("appid", appId);
    formData.append("newStatus", newStatus);
    formData.append("rejectionReason", finalReason);

    try {
      const response = await fetch("update_applicant_status.php", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        // alert(result.message); // <-- MODIFIED: REMOVED!
        window.location.reload(); // <-- MODIFIED: ADDED!
      } else {
        alert("Failed to update status: " + result.message); // Error alerts are OK
      }
    } catch (error) {
      console.error("AJAX Error:", error);
      alert(
        "An unexpected error occurred while updating the status. \n\nREASON: " +
          error.message
      ); // Error alerts are OK
    } finally {
      confirmRejectApplicantBtn.textContent = "Save";
      confirmRejectApplicantBtn.disabled = false;
    }
  });

  // --- New Event Listeners for ALL Email Status Modals (REFACTORED) ---

  // Close/Cancel buttons
  closeJobOfferModalBtn?.addEventListener("click", closeJobOfferModal); // MODIFIED
  cancelJobOfferModalBtn?.addEventListener("click", closeJobOfferModal); // MODIFIED

  // Generic listener for NEW modal close/cancel buttons
  document
    .querySelectorAll(
      ".btn-cancel[data-modal-target], .close-button[data-modal-target]"
    )
    .forEach((btn) => {
      btn.addEventListener("click", function () {
        const targetId = this.getAttribute("data-modal-target");
        if (targetId === "initialInterviewModal") {
          closeInitialInterviewModal();
        } else if (targetId === "technicalInterviewModal") {
          // MODIFIED
          closeTechnicalInterviewModal(); // MODIFIED
        }
      });
    });

  // Form submission handlers
  jobOfferForm?.addEventListener("submit", handleStatusEmailFormSubmit); // MODIFIED
  initialInterviewForm?.addEventListener("submit", handleStatusEmailFormSubmit);
  technicalInterviewForm?.addEventListener(
    "submit",
    handleStatusEmailFormSubmit
  ); // MODIFIED

  // ======================================================================
  // 4. NEW API-DRIVEN TABLE & FILTER LOGIC
  // ======================================================================

  let allApplicantData = []; // Holds all data from the API
  let filteredData = []; // Holds data after filtering (search, status, date)
  let currentPage = 1;
  let rowsPerPage = parseInt(applicantRowsPerPage?.value) || 5;
  const MAXPAGEBUTTONS = 5;

  // Date range state variables
  let startDate = null;
  let endDate = null;

  /**
   * Fetches applicant data from the API and initializes the table.
   */
  async function loadApplicantsByJobMatch() {
    // currentPostId is defined in a script tag in applicants.php
    if (typeof currentPostId === "undefined") {
      console.error("currentPostId is not defined.");
      showErrorState("Configuration error. Post ID missing.");
      return;
    }

    try {
      showLoadingState();

      const response = await fetch(
        `../api/get_applicants_by_job.php?post_id=${currentPostId}`
      );
      const data = await response.json();

      if (data.success) {
        // Store API data as the source of truth
        allApplicantData = data.applicants;
        // Update stats
        updateMatchStatistics(data);
        // Initial render
        renderApplicantTable();
      } else {
        console.error("Error loading applicants:", data.error);
        showErrorState(data.error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showErrorState("Failed to load applicants");
    }
  }

  /**
   * Renders the loading spinner in the table body.
   */
  function showLoadingState() {
    if (!applicantTableBody) return;
    applicantTableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <div class="spinner"></div>
                    <p>Loading applicants sorted by job fit score...</p>
                </div>
            </td>
        </tr>
    `;
  }

  /**
   * Renders an error message in the table body.
   * @param {string} message - The error message to display.
   */
  function showErrorState(message) {
    if (!applicantTableBody) return;
    applicantTableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 40px; color: #ef4444;">
                <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>${message}</p>
                <button onclick="loadApplicantsByJobMatch()" class="btn-retry" style="margin-top: 10px;">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </td>
        </tr>
    `;
  }

  /**
   * Updates the match statistics box above the table.
   * @param {object} data - The API response data.
   */
  function updateMatchStatistics(data) {
    // Remove existing stats box to prevent duplicates
    const existingStats = document.querySelector(".match-statistics");
    if (existingStats) {
      existingStats.remove();
    }

    const overviewHeader = document.querySelector(".overview-header");
    if (overviewHeader && data.total_applicants > 0) {
      const statsHtml = `
            <div class="match-statistics">
                <h4>Job Fit Analytics</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span>Total Applicants:</span>
                        <span class="stat-value">${data.total_applicants}</span>
                    </div>
                    <div class="stat-item">
                        <span>Matched Candidates:</span>
                        <span class="stat-value">${data.matched_applicants}</span>
                    </div>
                    <div class="stat-item">
                        <span>Match Rate:</span>
                        <span class="stat-value">${data.match_rate}%</span>
                    </div>
                    <div class="stat-item">
                        <span>Job Role:</span>
                        <span class="stat-value">${data.job_name}</span>
                    </div>
                </div>
            </div>
        `;

      // Insert after the main header
      const mainHeader = overviewHeader.querySelector("h2").parentElement;
      mainHeader.insertAdjacentHTML("afterend", statsHtml);
    }
  }

  /**
   * Generates the HTML for the status action dropdown.
   * @param {object} applicant - The applicant data object.
   * @returns {string} HTML string for the dropdown content.
   */
  function generateStatusDropdown(applicant) {
    const { status, application_id, name, email } = applicant;
    const statusLower = status.toLowerCase();
    let html = "";

    const statusMap = {
      "job offer":
        '<span class="dropdown-item status-info-item">Marked for Job Offer, awaiting user response</span>',
      failed:
        '<span class="dropdown-item status-info-item">Already Marked as Failed</span>',
      "job offer accepted":
        '<span class="dropdown-item status-info-item">User accepted the job offer</span>',
      "job offer rejected":
        '<span class="dropdown-item status-info-item">User rejected the job offer</span>',
    };

    if (statusMap[statusLower]) {
      html = statusMap[statusLower];
    } else {
      if (statusLower === "pending") {
        html += `<a href="#" class="dropdown-item open-status-modal" data-appid="${application_id}" data-new-status="Initial Interview" data-name="${name}" data-email="${email}" style="color: #b45309;">
                    Move to Initial Interview
                </a><div class="dropdown-divider"></div>`;
      }
      if (statusLower === "initial interview") {
        html += `<a href="#" class="dropdown-item open-status-modal" data-appid="${application_id}" data-new-status="Technical Interview" data-name="${name}" data-email="${email}" style="color: #2563eb;">
                    Move to Technical Interview
                </a><div class="dropdown-divider"></div>`;
      }
      if (statusLower === "technical interview") {
        html += `<a href="#" class="dropdown-item update-applicant-status" data-appid="${application_id}" data-new-status="Job Offer" style="color: #22c55e;">
                    Mark for Job Offer
                </a><div class="dropdown-divider"></div>`;
      }
      html += `<a href="#" class="dropdown-item update-applicant-status" data-appid="${application_id}" data-new-status="Failed" style="color: #ef4444;">
                Mark as Failed
            </a>`;
    }
    return html;
  }

  /**
   * Filters, sorts, paginates, and renders the applicant table.
   */
  function renderApplicantTable() {
    if (
      !applicantTableBody ||
      !applicantPaginationInfo ||
      !applicantPrevPage ||
      !applicantNextPage ||
      !applicantPageNumbers
    ) {
      console.error("Table or pagination controls not found.");
      return;
    }

    const searchTerm = applicantSearch.value.toLowerCase().trim();
    const statusFilter = applicantStatusFilter.value.toLowerCase();
    const sortOrder = applicantSortOrder.value;

    // 1. Filtering
    filteredData = allApplicantData.filter((applicant) => {
      const searchText = (applicant.name + " " + applicant.email).toLowerCase();
      const matchesSearch = searchText.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        applicant.status.toLowerCase() === statusFilter;

      // Date Filter Logic
      const rowDate = applicant.date_applied; // 'YYYY-MM-DD'
      let dateMatch = true;
      if (startDate && rowDate) {
        if (endDate) {
          // Range selected
          dateMatch = rowDate >= startDate && rowDate <= endDate;
        } else {
          // Only start date selected
          dateMatch = rowDate === startDate;
        }
      }
      return matchesSearch && matchesStatus && dateMatch;
    });

    // 2. Sorting
    filteredData.sort((a, b) => {
      switch (sortOrder) {
        case "asc":
          return a.name.localeCompare(b.name);
        case "desc":
          return b.name.localeCompare(a.name);
        case "newest":
          return new Date(b.date_applied) - new Date(a.date_applied);
        case "oldest":
          return new Date(a.date_applied) - new Date(b.date_applied);
        case "default":
        default:
          // Default sort is by match_percentage (from API)
          // We just need to maintain the original API order if "default" is selected
          // Or, more accurately, re-apply the API's default sort
          if (b.match_percentage !== a.match_percentage) {
            return b.match_percentage - a.match_percentage;
          }
          return new Date(b.date_applied) - new Date(a.date_applied);
      }
    });

    // 3. Pagination Setup
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    // 4. Render Table Body
    applicantTableBody.innerHTML = "";
    if (paginatedData.length === 0) {
      applicantTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center;">
                        No Applicants Found Matching Your Criteria
                    </td>
                </tr>
            `;
    } else {
      let html = "";
      paginatedData.forEach((applicant) => {
        const dateApplied = formatDate(applicant.date_applied);

        // Status class logic
        const statusLower = applicant.status.toLowerCase();
        let statusClass = "status-pending";
        let statusDisplay = "Pending";
        const statusMap = {
          "job offer": ["status-job-offer", "Job Offer"],
          failed: ["status-failed", "Failed"],
          "initial interview": [
            "status-initial-interview",
            "Initial Interview",
          ],
          "technical interview": [
            "status-technical-interview",
            "Technical Interview",
          ],
          "job offer accepted": ["status-job-accepted", "Job Offer Accepted"],
          "job offer rejected": ["status-job-rejected", "Job Offer Rejected"],
        };
        if (statusMap[statusLower]) {
          [statusClass, statusDisplay] = statusMap[statusLower];
        }

        // Match badge
        let matchBadge = "";
        if (applicant.is_match) {
          matchBadge = `<span class='match-badge' title='Job Fit Score: ${applicant.match_percentage}%'><i class='fas fa-star'></i> ${applicant.match_percentage}% Match</span>`;
        } else if (applicant.has_recommendation) {
          matchBadge = `<span class='no-match-badge' title='No specific match for this job role'><i class='fas fa-info-circle'></i> Other Role</span>`;
        }

        // User avatar
        let userAvatar = "";
        if (applicant.avatar) {
          userAvatar = `<img src="${applicant.avatar}" alt="User Avatar" class="avatar-circle-small">`;
        } else {
          const initials = applicant.first_name
            ? applicant.first_name.charAt(0).toUpperCase()
            : "U";
          userAvatar = `<div class="avatar-circle-small" style="background-color: #2f80ed;">${initials}</div>`;
        }

        // Row class for highlighting
        const rowClass = applicant.is_match ? "job-match-highlight" : "";

        // Escape single quotes in JSON string for the data attribute
        const applicantDataString = JSON.stringify(applicant).replace(
          /'/g,
          "&#39;"
        );

        html += `
                    <tr class="${rowClass}" 
                        data-appid="${applicant.application_id}" 
                        data-userid="${applicant.user_id}" 
                        data-date="${applicant.date_applied}" 
                        data-applicant-data='${applicantDataString}'>
                        
                        <td>${applicant.application_id}</td>
                        <td>${applicant.user_id}</td>
                        <td>
                            <div class="user-cell">
                                ${userAvatar}
                                ${applicant.name}
                                ${matchBadge}
                            </div>
                        </td>
                        <td>${applicant.email}</td>
                        <td>${dateApplied}</td>
                        <td><span class="status-tag ${statusClass}">${statusDisplay}</span></td>
                        <td><a href="view_resume.php?appid=${applicant.application_id}" class="view-resume" title="View Resume" target="_blank"><i class="fas fa-file"></i> View</a></td>
                        <td class="actions-cell">
                            <i class="fas fa-eye action-icon view-applicant" title="View Applicant Details"></i>
                            
                            <div class="action-dropdown-wrapper">
                                <i class="fas fa-pen-to-square action-icon status-dropdown-toggle" title="Update Application Status"></i>
                                <div class="action-dropdown">
                                    ${generateStatusDropdown(applicant)}
                                </div>
                            </div>
                            
                            <i class="fas fa-archive action-icon archive-applicant" data-appid="${
                              applicant.application_id
                            }" title="Archive Application"></i>
                        </td>
                    </tr>
                `;
      });
      applicantTableBody.innerHTML = html;
    }

    // 5. Update Pagination Info
    const startCount = totalRows === 0 ? 0 : start + 1;
    const endCount = Math.min(end, totalRows);
    applicantPaginationInfo.textContent = `Showing ${startCount} to ${endCount} of ${totalRows} applicants`;

    // 6. Update Pagination Buttons
    applicantPrevPage.disabled = currentPage === 1;
    applicantNextPage.disabled = currentPage === totalPages;

    applicantPageNumbers.innerHTML = "";
    let startPage = Math.max(1, currentPage - Math.floor(MAXPAGEBUTTONS / 2));
    let endPage = Math.min(totalPages, startPage + MAXPAGEBUTTONS - 1);
    if (endPage - startPage + 1 < MAXPAGEBUTTONS) {
      startPage = Math.max(1, endPage - MAXPAGEBUTTONS + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = "pagination-button page-number";
      if (i === currentPage) pageBtn.classList.add("active");
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        renderApplicantTable();
      });
      applicantPageNumbers.appendChild(pageBtn);
    }
  }

  // --- *** NEW: Date Range Picker Initialization *** ---
  if (applicantDateRange) {
    $(applicantDateRange).datepicker({
      dateFormat: "yy-mm-dd",
      onSelect: (dateText, inst) => {
        if (!startDate || (startDate && endDate)) {
          // Start new selection
          startDate = dateText;
          endDate = null;
          $(applicantDateRange).val(dateText + " to ");
        } else if (!endDate && startDate && dateText >= startDate) {
          // Finish selection
          endDate = dateText;
          $(applicantDateRange).val(startDate + " to " + endDate);
          currentPage = 1; // Reset to first page
          renderApplicantTable(); // Re-filter
        } else if (dateText < startDate) {
          // Start new selection if "to" date is before "from"
          startDate = dateText;
          endDate = null;
          $(applicantDateRange).val(dateText + " to ");
        }
      },
    });

    // Clear logic
    $(applicantDateRange).on("click", () => {
      if (startDate && endDate) {
        startDate = null;
        endDate = null;
        $(applicantDateRange).val("");
        currentPage = 1; // Reset to first page
        renderApplicantTable(); // Re-filter
      }
    });
  }

  // Event Listeners for Table Controls
  applicantSearch?.addEventListener("input", () => {
    currentPage = 1;
    renderApplicantTable();
  });

  applicantStatusFilter?.addEventListener("change", () => {
    currentPage = 1;
    renderApplicantTable();
  });

  applicantSortOrder?.addEventListener("change", () => {
    currentPage = 1;
    renderApplicantTable();
  });

  applicantRowsPerPage?.addEventListener("change", (e) => {
    rowsPerPage = parseInt(e.target.value) || 5;
    currentPage = 1;
    renderApplicantTable();
  });

  applicantPrevPage?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderApplicantTable();
    }
  });

  applicantNextPage?.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      renderApplicantTable();
    }
  });

  // Initialize the table data by fetching from API
  loadApplicantsByJobMatch();

  // --- Generate Report Button ---
  document.querySelectorAll(".generateApplicantReportBtn").forEach((button) => {
    button.addEventListener("click", function () {
      // currentPostId is defined in applicants.php
      if (typeof currentPostId !== "undefined" && currentPostId >= 0) {
        window.open("applicantreport.php?postid=" + currentPostId, "_blank");
      } else {
        alert("Error: No Job Post ID found.");
      }
    });
  });
});
