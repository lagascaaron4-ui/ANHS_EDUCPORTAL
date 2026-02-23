document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("enrollmentForm")
  if (!form) return
  const disabilityCheckbox = document.getElementById("hasDisability")
  const disabilityOptions = document.getElementById("disabilityOptions")
  const sameAddressCheckbox = document.getElementById("sameAddress")
  const permanentAddressFields = document.getElementById("permanentAddressFields")
  const returningLearnerCheckbox = document.getElementById("returningLearner")
  const returningLearnerSection = document.getElementById("returningLearnerSection")
  const ipCheckbox = document.getElementById("isIP")
  const ipSpecify = document.getElementById("ipSpecify")
  const fpsCheckbox = document.getElementById("is4Ps")
  const fpsHouseholdId = document.getElementById("fpsHouseholdId")
  const gradeLevelSelect = document.getElementById("gradeLevel")
  const seniourHighSchoolSection = document.getElementById("seniourHighSchoolSection")

  // Toggle disability options
  disabilityCheckbox.addEventListener("change", function () {
    disabilityOptions.style.display = this.checked ? "block" : "none"
  })

  // Toggle permanent address fields
  sameAddressCheckbox.addEventListener("change", function () {
    permanentAddressFields.style.display = this.checked ? "none" : "block"
  })

  // Toggle returning learner section
  returningLearnerCheckbox.addEventListener("change", function () {
    returningLearnerSection.style.display = this.checked ? "block" : "none"
  })

  // Toggle IP specification
  ipCheckbox.addEventListener("change", function () {
    ipSpecify.style.display = this.checked ? "block" : "none"
  })

  // Toggle 4Ps household ID
  fpsCheckbox.addEventListener("change", function () {
    fpsHouseholdId.style.display = this.checked ? "block" : "none"
  })

  // Toggle Senior High School section
  gradeLevelSelect.addEventListener("change", function () {
    const isHighSchool = this.value && (this.value.includes("Grade 11") || this.value.includes("Grade 12"))
    seniourHighSchoolSection.style.display = isHighSchool ? "block" : "none"
  })

  // Auto-calculate age from birthdate
  const birthdateInput = document.getElementById("birthdate")
  const ageInput = document.getElementById("age")

  birthdateInput.addEventListener("change", function () {
    const birthdate = new Date(this.value)
    const today = new Date()
    let age = today.getFullYear() - birthdate.getFullYear()
    const monthDiff = today.getMonth() - birthdate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--
    }

    if (!isNaN(age)) {
      ageInput.value = age
    }
  })

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Collect form data
    const formData = new FormData(form)
    const data = Object.fromEntries(formData)

    console.log("[v0] Form submitted with data:", data)

    // Show success message
    showSuccessMessage("Enrollment form submitted successfully!")

    // Reset form after 2 seconds
    setTimeout(() => {
      form.reset()
      // Reset all conditional sections
      disabilityOptions.style.display = "none"
      permanentAddressFields.style.display = "block"
      returningLearnerSection.style.display = "none"
      ipSpecify.style.display = "none"
      fpsHouseholdId.style.display = "none"
      seniourHighSchoolSection.style.display = "none"
    }, 2000)
  })

  // Helper function to show success message
  function showSuccessMessage(message) {
    const messageDiv = document.createElement("div")
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--success-color);
            color: white;
            padding: 16px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `
    messageDiv.textContent = message
    document.body.appendChild(messageDiv)

    setTimeout(() => {
      messageDiv.style.animation = "slideOut 0.3s ease"
      setTimeout(() => messageDiv.remove(), 300)
    }, 2000)
  }

  // Add animation styles
  const style = document.createElement("style")
  style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `
  document.head.appendChild(style)
})
