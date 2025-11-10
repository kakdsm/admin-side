<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ADMIN JOBFITSYSTEM</title>
  <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.0/themes/base/jquery-ui.css">
  <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
  <script src="https://code.jquery.com/ui/1.14.0/jquery-ui.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
  <link rel="stylesheet" href="../css/applicants.css">
</head>
<body>
<?php
session_start();
include 'database.php';
if (!isset($_SESSION['admin'])) {
  header("Location: admin_login.php");
  exit();
}

if (isset($_GET['logout'])) {
  session_unset();
  session_destroy();
  header('Location: admin_login.php');
  exit();
}

include 'admin_profile_modal.php'; 
$adminName = "Administrator";
$avatarInitials = "AD";
$adminImageBase64 = null; 
$adminEmail = $_SESSION['admin'];
$stmt = $con->prepare("SELECT adminname, adminpassword, adminimage FROM admin WHERE adminemail = ?");
$stmt->bind_param("s", $adminEmail);
$stmt->execute();
$res = $stmt->get_result();
$adminData = null;
if ($res->num_rows === 1) {
    $adminData = $res->fetch_assoc();
    $adminName = $adminData['adminname'];
    $nameParts = explode(" ", trim($adminName));
    $avatarInitials = strtoupper(substr($nameParts[0], 0, 1));
    if (count($nameParts) > 1) {
        $avatarInitials .= strtoupper(substr($nameParts[1], 0, 1));
    }
    if (!empty($adminData['adminimage'])) {
        $adminImageBase64 = 'data:image/jpeg;base64,' . base64_encode($adminData['adminimage']);
    }
}
$stmt->close();

$systemName = "JOBFIT"; 
$systemLogoBase64 = '../image/jftlogo.png'; 

$stmtSys = $con->prepare("SELECT sysname, sysimage FROM systemname WHERE sysid = 1");
$stmtSys->execute();
$resSys = $stmtSys->get_result();
if ($resSys->num_rows === 1) {
    $sysData = $resSys->fetch_assoc();
    $systemName = htmlspecialchars($sysData['sysname']);
    if (!empty($sysData['sysimage'])) {
        $systemLogoBase64 = 'data:image/jpeg;base64,' . base64_encode($sysData['sysimage']);
    }
}
$stmtSys->close();

$message = '';
$message_type = ''; // 'success' or 'error'

if (isset($_SESSION['message'])) {
    $message = $_SESSION['message'];
    $message_type = $_SESSION['message_type'];
    unset($_SESSION['message'], $_SESSION['message_type']);
}

?>

<button class="burger" aria-label="Toggle sidebar"><i class="fas fa-bars"></i></button>
  <aside class="sidebar" aria-label="Sidebar navigation">
    <div class="logo">
        <img src="<?php echo $systemLogoBase64; ?>" alt="JOBFIT logo" class="logo-img">
    </div>
    <div class="title">
        <?php echo $systemName; ?>
    </div>
    <nav>
<a  href="dashboard.php">
  <i class="fas fa-home"></i> Dashboard
</a>
<a href="analytics.php">
  <i class="fas fa-chart-bar"></i> Test Analytics
</a>

<a href="users.php">
  <i class="fas fa-users-cog"></i> Users  
</a>
<a class="active" aria-current="page" href="posting.php">
 <i class="fas fa-briefcase"></i> Job Posting
</a>
<a href="settings.php">
  <i class="fas fa-cog"></i> Settings
</a>
</nav>
    <a href="#" id="logoutBtn" class="logout">Logout</a>
  </aside>

<div class="logout-modal" id="logoutModal">
  <div class="logout-modal-content">
    <i class="fas fa-sign-out-alt"></i>
    <h2>LOG OUT</h2>
    <p>Are you sure you want to logout?</p>
    <div class="logout-modal-buttons">
      <button class="btn-no" id="cancelLogout">NO</button>
      <button class="btn-yes" onclick="window.location.href='?logout=true'">YES</button>
    </div>
  </div>
</div>

<main class="content">
<section id="dashboard-header">
  <div class="top-header">
    <div class="header-left">
      <div class="admin-label">
  Homepage > 
  <a href="posting.php" class="admin-label no-underline">Job Posting</a> > 
  <span style="font-weight: bold;">Job Applicants</span>
</div>

    </div>

    <div class="user-profile" onclick="toggleDropdown()">
        <?php if ($adminImageBase64): ?>
                <img src="<?php echo $adminImageBase64; ?>" alt="Admin Avatar" class="avatar-circle">
            <?php else: ?>
                <div class="avatar-circle"><?php echo htmlspecialchars($avatarInitials); ?></div>
            <?php endif; ?>
            <div class="user-info">
              <div class="user-name"><?php echo htmlspecialchars($adminName); ?></div>
              <div class="user-role">Administrator</div>
            </div>
      <div class="dropdown-icon">▼</div>

      <div class="user-dropdown" id="user-dropdown">
      <a href="#" id="viewProfileModalBtn">View Profile</a>
      <a href="settings.php">Settings</a>
      <a href="#" id="logoutDropdownBtn" class="logout">Logout</a>
      </div>
    </div>
  </div>
</section>


<?php
// FIXED: Allow postid 0 by checking >= 0 instead of > 0
$postID = isset($_GET['postid']) ? (int)$_GET['postid'] : -1;
$jobRole = "No Job Post Selected"; 

// FIXED: Check if postID is >= 0 instead of > 0
if ($postID >= 0) {
    // Get the job role from the posting
    $titleStmt = $con->prepare("SELECT postjobrole FROM jobposting WHERE postid = ?");
    $titleStmt->bind_param("i", $postID);
    $titleStmt->execute();
    $titleResult = $titleStmt->get_result();
    if ($titleResult->num_rows > 0) {
        $jobData = $titleResult->fetch_assoc();
        $jobRole = htmlspecialchars($jobData['postjobrole']);
    } else {
        $jobRole = "Job Post Not Found";
    }
    $titleStmt->close();
} else {
    $jobRole = "Invalid Job Post ID";
}

// FIXED: Allow postid 0 for archived count
$archivedCount = 0;
if ($postID >= 0) {
    $countStmt = $con->prepare("SELECT COUNT(*) AS archived_count FROM archived_applicants WHERE postid = ?");
    $countStmt->bind_param("i", $postID);
    $countStmt->execute();
    $countResult = $countStmt->get_result();

    if ($countResult->num_rows > 0) {
        $countData = $countResult->fetch_assoc();
        $archivedCount = (int)$countData['archived_count'];
    }
    $countStmt->close();
}
?>

<section class="dashboard-overview">
    <div class="overview-header">
        <h2>Job Applicants</h2>
        <p>Viewing applicants for: <span style="font-weight: bold;"><?php echo $jobRole; ?></span></p>
        <input type="hidden" id="currentViewingJobRole" value="<?php echo htmlspecialchars($jobRole); ?>">
    </div>
    
    <div class="users-section">
        <a href="posting.php" class="back-link">
        <i class="fa-solid fa-arrow-left"></i> BACK
    </a>
        <div class="bordered-section">
            
            <div class="section-header">
                <div>
                    <h3>Applicants List</h3> 
                    <p>A list of all users who applied for this job post.</p>
                </div>
                <div class="button-group">
                    <button class="report-button generateApplicantReportBtn" data-postid="<?php echo $postID; ?>">
                        <i class="fas fa-file-alt"></i> Generate Report
                    </button>
                </div>
            </div>
            
            <div class="search-filter-controls">
                <div class="search-box">
                    <input type="text" class="search-input" id="applicantSearch" placeholder="Search applicants by name or email...">
                </div>
                <div class="filters">
                    <select class="filter-select" id="applicantStatusFilter"> 
                        <option value="all">Status</option>
                        <option value="pending">Pending</option>
                        <option value="initial interview">Initial Interview</option>
                        <option value="technical interview">Technical Interview</option>
                        <option value="Job Offer">Job Offer</option>
                        <option value="Job Offer Accepted">Job Offer Accepted</option>
                        <option value="Job Offer Rejected">Job Offer Rejected</option>
                        <option value="Failed">Failed</option>
                    </select>
                    <select class="filter-select" id="applicantSortOrder">
                        <option value="default">Default Order</option>
                        <option value="newest">Applied Date (Newest)</option>
                        <option value="oldest">Applied Date (Oldest)</option>
                        <option value="asc">Name (A-Z)</option>
                        <option value="desc">Name (Z-A)</option>
                    </select>
                    <input type="text" class="filter-select date-range-input" id="applicantDateRange" placeholder="Select Date Range" readonly>
                    
                    <a href="archive.php?postid=<?php echo $postID; ?>" id="archivedBtn" class="archive-btn">ARCHIVED (<span style="color: red; font-weight: bold;"><?php echo $archivedCount; ?></span>)</a>                      
                </div>
            </div>
            
            <div class="table-container">
                <table id="applicantsTable"> 
                    <thead>
                        <tr>
                            <th>APP ID</th> 
                            <th>USER ID</th>
                            <th>NAME</th>
                            <th>EMAIL</th>
                            <th>Date Applied</th>
                            <th>STATUS</th>
                            <th>RESUME</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody id="applicantsTableBody">
                        </tbody>
                </table>
            </div>
            
            <div class="pagination-controls">
                <div class="pagination-info" id="applicantPaginationInfo">Showing 0 to 0 of 0 applicants</div> 

                <div class="pagination-buttons">
                    <button class="pagination-button" id="applicantPrevPage"><i class="fas fa-chevron-left"></i></button>
                    <div class="page-numbers" id="applicantPageNumbers">
                    </div>
                    <button class="pagination-button" id="applicantNextPage"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="pagination-rows-per-page">
                    <select id="applicantRowsPerPage" class="rows-per-page-select">
                        <option value="5">5 per page</option>
                        <option value="10" selected>10 per page</option>
                        <option value="20">20 per page</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</section>
  </main>

  <div class="modal user-profile-modal" id="viewUserProfileModal">
    <div class="modal-content user-profile-content">
        <div class="modal-header">
            <h2>Applicant Profile</h2>
            <span class="close-button" id="closeUserProfileModal">&times;</span>
        </div>
        <div class="modal-body">
            <div class="profile-summary">
                <div class="avatar-circle-large" id="profileAvatar">JS</div>
                <div class="profile-name" id="profileFullName">John Smith</div>
                <div class="profile-email" id="profileEmailSummary">john.smith@example.com</div>
                <p class="profile-status" id="profileStatus"></p>
            </div>
            <p class="null-field-instruction" id="nullFieldInstruction">
                <i class="fas fa-exclamation-circle"></i> Red highlights indicate fields not yet set by the user.
            </p>

            <div class="profile-section">
                <div class="section-icon"><i class="fas fa-user"></i></div>
                <div class="section-title">Personal Information</div>
                <div class="section-fields">
                    <div class="form-field">
                        <label for="viewUserId">User ID</label>
                        <input type="text" id="viewUserId" readonly>
                    </div>
                    <div class="form-field">
                        <label>Full Name</label>
                        <input type="text" id="viewFullName" readonly>
                    </div>
                    <div class="form-field-group">
                        <div class="form-field">
                            <label>Date of Birth</label>
                            <input type="text" id="viewDOB" readonly>
                        </div>
                        <div class="form-field">
                            <label>Age (Automated)</label>
                            <input type="text" id="viewAge" readonly>
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="section-icon"><i class="fas fa-envelope"></i></div>
                <div class="section-title">Contact Information</div>
                <div class="section-fields">
                    <div class="form-field-group">
                        <div class="form-field">
                            <label>Email Address</label>
                            <input type="email" id="viewEmail" readonly>
                        </div>
                    </div>
                    <div class="form-field">
                        <label>Phone Number</label>
                        <input type="text" id="viewContact" readonly>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="section-icon"><i class="fas fa-graduation-cap"></i></div>
                <div class="section-title">Educational Background</div>
                <div class="section-fields">

                    <div class="form-field">
                        <label for="viewEduLvl">Educational Level</label>
                        <input type="text" id="viewEduLvl" class="form-control" readonly>
                    </div>

                    <div class="form-field">
                        <label for="viewCourse">Course</label>
                        <input type="text" id="viewCourse" class="form-control" readonly>
                    </div>

                    <div class="form-field">
                        <label for="viewSchool">School</label>
                        <input type="text" id="viewSchool" class="form-control" readonly>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="section-icon"><i class="fas fa-info-circle"></i></div>
                <div class="section-title">System Information</div>
                <div class="section-fields">
                    <div class="form-field">
                        <label>Joined Date</label>
                        <input type="text" id="viewSignupDate" readonly>
                    </div>
                </div>
            </div>
            <div class="profile-section">
                <div class="section-icon"><i class="fas fa-info-circle"></i></div>
                <div class="section-title">JOB FIT TEST SCORE</div>
                <div class="section-fields">
                    <div class="form-field">
                        <label>Job role match</label>
                        <input type="text" id="rolematch" readonly>
                    </div>
                    <div class="form-field">
                         <label>percentage</label>
                        <input type="text" id="rolepercentage" readonly>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-close" id="profileModalCloseBtn">Close</button>
        </div>
    </div>
</div>


<div class="delete-user-modal" id="archiveApplicantModal">
    <div class="delete-user-modal-content">
        <div class="delete-icon-container">
            <i class="fas fa-archive delete-warning-icon"></i> 
        </div>
        <h2>Archive Application</h2>
        <p class="delete-warning-text">Archiving this application will move it out of the active list.</p>
        <p class="delete-confirmation-text">Are you sure you want to archive the application for <span id="archiveApplicantFullName" style="font-weight: bold;">[Applicant Name]</span> (ID: <span id="archiveApplicantAppId" style="font-weight: bold;">[ID]</span>)?</p>
        
        <input type="hidden" id="appToArchiveId" value="">
        <input type="hidden" id="userToArchiveId" value="">

        <div class="modal-buttons">
            <button class="btn-cancel" id="cancelArchiveApplicant">Cancel</button>
            <button class="btn-delete" id="confirmArchiveApplicant">Archive</button>
        </div>
    </div>
</div>


<div class="modal delete-user-modal" id="rejectApplicantModal">
    <div class="modal-content delete-user-modal-content" style="max-width: 500px;">
        <div class="delete-icon-container" style="background-color: #fef2f2;">
            <i class="fas fa-ban delete-warning-icon" style="color: #ef4444;"></i> 
        </div>
        <h2>Failed Application</h2>
        
        <p class="delete-warning-text" style="color: #ef4444; font-weight: bold;">This reason will be sent to the applicant via email.</p>

        <p class="delete-confirmation-text">
            Please select the reason for marking the application as 'Failed' for <span id="rejectApplicantFullName" style="font-weight: bold;">[Applicant Name]</span> (ID: <span id="rejectApplicantAppId" style="font-weight: bold;">[ID]</span>).
        </p>
        
        <div class="form-field" style="margin-top: 20px; text-align: left;">
            <label for="rejectionReasonSelect" style="display: block; font-weight: bold; margin-bottom: 5px;">Reason for Failure:</label>
            <select id="rejectionReasonSelect" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="" disabled selected>Select a rejection reason</option>
                <option value="Does not meet job qualifications">Does not meet job qualifications</option>
                <option value="Insufficient skills for the position">Insufficient skills for the position</option>
                <option value="Incomplete or missing resume details">Incomplete or missing resume details</option>
                <option value="Resume not relevant to the job position">Resume not relevant to the job position</option>
                <option value="Failed the initial interview">Failed the initial interview</option>
                <option value="Failed the technical interview">Failed the technical interview</option> <option value="Did not attend the scheduled interview">Did not attend the scheduled interview</option>
                <option value="Poor communication skills during the interview">Poor communication skills during the interview</option>
                <option value="Lack of required experience">Lack of required experience</option>
                <option value="Position already filled">Position already filled</option>
                <option value="Other reason">Other reason:</option>
            </select>
        </div>
        
        <div class="form-field" id="otherReasonField" style="margin-top: 15px; text-align: left; display: none;">
            <label for="otherReasonText" style="display: block; font-weight: bold; margin-bottom: 5px;">Other reason details:</label>
            <textarea id="otherReasonText" class="form-control" placeholder="Enter specific rejection details here..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
        </div>

        <input type="hidden" id="appToRejectId" value="">
        <input type="hidden" id="userToRejectEmail" value="">
        <input type="hidden" id="userToRejectName" value="">

        <div class="modal-buttons" style="margin-top: 25px;">
            <button class="btn-cancel" id="cancelRejectApplicant">Cancel</button>
            <button class="btn-delete" id="confirmRejectApplicant" style="background-color: #ef4444; color: white;">Save</button>
        </div>
    </div>
</div>



<div class="popup-overlay -approve-email" id="jobOfferModal" style="display: none;">
   <div class="popup-box -email-content">
       <div class="popup-header approve-header"> <h2>Mark for Job Offer & Send Email</h2>
           <span class="close-button" id="closeJobOfferModal">&times;</span>
       </div>
       
       <form id="jobOfferForm" data-status-form="job-offer">
           <div class="popup-body">
               <input type="hidden" id="appToJobOfferId" name="appid">
               <input type="hidden" id="jobRoleToJobOffer" name="jobRole">
               <input type="hidden" name="newStatus" value="Job Offer">

               <p class="approve-instruction">
                ⚠️ This email will be sent directly to <strong id="jobOfferApplicantFullName"></strong>.  
                You can edit the email and include the job offer details before sending.
                </p>

               <div class="form-field-email">
                   <label for="job-offer-recipient-email">Recipient Email</label>
                   <input type="email" id="job-offer-recipient-email" name="recipient_email" class="form-control readonly" readonly required>
               </div>
               
               <div class="form-field-email">
                   <label for="job-offer-subject">Subject</label>
                   <input type="text" id="job-offer-subject" name="subject" class="form-control" required>
               </div>
               
               <div class="form-field-email">
                   <label for="job-offer-message">Custom Email Message</label>
                   <div id="quill-editor-job-offer"></div> <textarea id="job-offer-message-hidden" name="customMessage" style="display:none;"></textarea> </div>
           </div>
           
           <div class="popup-footer">
               <button type="button" class="btn-cancel" id="cancelJobOfferModal">Cancel</button>
               <button type="submit" id="confirmJobOffer" class="save-button primary-button">Send Email & Mark for Job Offer</button>
           </div>
       </form>
   </div>
</div>


<div class="popup-overlay -status-email" id="initialInterviewModal" style="display: none;">
   <div class="popup-box -email-content">
       <div class="popup-header initial-interview-header">
           <h2>Move to Initial Interview & Schedule</h2>
           <span class="close-button" data-modal-target="initialInterviewModal">&times;</span>
       </div>
       
       <form data-status-form="initial interview" id="initialInterviewForm">
           <div class="popup-body">
               <input type="hidden" id="appToInitialInterviewId" name="appid">
               <input type="hidden" id="jobRoleToInitialInterview" name="jobRole">
               <input type="hidden" name="newStatus" value="Initial Interview">

               <p class="initial-instruction">
                ⚠️ This email will be sent directly to <strong data-full-name="initialInterview"></strong>.  
                You can edit the email and include the interview schedule before sending.
                </p>

               <div class="form-field-email">
                   <label for="initial-interview-recipient-email">Recipient Email</label>
                   <input type="email" id="initial-interview-recipient-email" name="recipient_email" class="form-control readonly" readonly required>
               </div>
               
               <div class="form-field-email">
                   <label for="initial-interview-subject">Subject</label>
                   <input type="text" id="initial-interview-subject" name="subject" class="form-control" required>
               </div>
               
               <div class="form-field-email">
                   <label for="initial-interview-message">Custom Email Message</label>
                   <div id="quill-editor-initial-interview"></div>
                   <textarea id="initial-interview-message-hidden" name="customMessage" style="display:none;"></textarea>
               </div>
           </div>
           
           <div class="popup-footer">
               <button type="button" class="btn-cancel" data-modal-target="initialInterviewModal">Cancel</button>
               <button type="submit" class="save-button initial-button">Send Email & Move to Initial Interview</button>
           </div>
       </form>
   </div>
</div>

<div class="popup-overlay -status-email" id="technicalInterviewModal" style="display: none;">
   <div class="popup-box -email-content">
       <div class="popup-header final-interview-header"> <h2>Move to Technical Interview & Schedule</h2>
           <span class="close-button" data-modal-target="technicalInterviewModal">&times;</span>
       </div>
       
       <form data-status-form="technical interview" id="technicalInterviewForm">
           <div class="popup-body">
               <input type="hidden" id="appToTechnicalInterviewId" name="appid">
               <input type="hidden" id="jobRoleToTechnicalInterview" name="jobRole">
               <input type="hidden" name="newStatus" value="Technical Interview">

               <p class="final-instruction"> ⚠️ This email will be sent directly to <strong data-full-name="technicalInterview"></strong>.  
                You can edit the email and include the interview schedule before sending.
                </p>

               <div class="form-field-email">
                   <label for="technical-interview-recipient-email">Recipient Email</label>
                   <input type="email" id="technical-interview-recipient-email" name="recipient_email" class="form-control readonly" readonly required>
               </div>
               
               <div class="form-field-email">
                   <label for="technical-interview-subject">Subject</label>
                   <input type="text" id="technical-interview-subject" name="subject" class="form-control" required>
               </div>
               
               <div class="form-field-email">
                   <label for="technical-interview-message">Custom Email Message</label>
                   <div id="quill-editor-technical-interview"></div> <textarea id="technical-interview-message-hidden" name="customMessage" style="display:none;"></textarea> </div>
           </div>
           
           <div class="popup-footer">
               <button type="button" class="btn-cancel" data-modal-target="technicalInterviewModal">Cancel</button>
               <button type="submit" class="save-button final-button">Send Email & Move to Technical Interview</button>
           </div>
       </form>
   </div>
</div>


<?php if ($message): ?>
  <div id="message" class="custom-alert <?= $message_type ?> show">
    <?= htmlspecialchars($message) ?>
  </div>
<?php endif; ?>

<script>
  const currentPostId = <?php echo $postID; ?>;
  const currentJobRole = "<?php echo htmlspecialchars($jobRole); ?>";

  if ("<?= $message ?>") {
    setTimeout(() => {
      document.getElementById('message')?.classList.remove('show');
    }, 3000);
  }
</script>

<script src="../js/applicants.js"></script>
</body>
</html>
