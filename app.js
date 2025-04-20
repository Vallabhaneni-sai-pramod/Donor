window.onload = function () {
    fetch("http://localhost:5000/students")
      .then(res => res.json())
      .then(data => {
        const studentSelect = document.getElementById("studentId");
        const fundSelect = document.getElementById("fundStudentId");
  
        // Clear old options
        studentSelect.innerHTML = `<option value="">-- Select Student --</option>`;
        fundSelect.innerHTML = `<option value="">-- Select Student --</option>`;
  
        data.forEach(student => {
          const label = `${student.name} (ID: ${student.id})${student.isSponsored ? " - Sponsored" : ""}`;
  
          const option1 = document.createElement("option");
          option1.value = student.id;
          option1.text = label;
          option1.dataset.email = student.email;
          option1.dataset.gpa = student.gpa;
          option1.dataset.education = student.education_level;
          option1.dataset.income = student.income;
          option1.dataset.sponsored = student.isSponsored;
          studentSelect.appendChild(option1);
  
          const option2 = option1.cloneNode(true);
          fundSelect.appendChild(option2);
        });
      });
  };
  
  function showStudentDetails() {
    const select = document.getElementById("studentId");
    const selectedOption = select.options[select.selectedIndex];
  
    if (!selectedOption.value) {
      document.getElementById("studentDetails").innerHTML = "";
      return;
    }
  
    const name = selectedOption.text.split(" (ID:")[0];
    const email = selectedOption.dataset.email;
    const gpa = selectedOption.dataset.gpa;
    const education = selectedOption.dataset.education;
    const income = selectedOption.dataset.income;
    const id = selectedOption.value;
  
    document.getElementById("studentDetails").innerHTML = `
      <strong>${name}</strong><br/>
      <strong>Email:</strong> ${email}<br/>
      <strong>GPA:</strong> ${gpa}<br/>
      <strong>Education Level:</strong> ${education}<br/>
      <strong>Income:</strong> ₹${income}<br/>
      <strong>Student ID:</strong> ${id}
    `;
  }
  
  function sponsorStudent() {
    const studentSelect = document.getElementById("studentId");
    const studentId = studentSelect.value;
  
    if (!studentId) return alert("❌ Please select a student.");
  
    const isSponsored = studentSelect.options[studentSelect.selectedIndex].dataset.sponsored == "1";
    if (isSponsored) return alert("❌ This student is already sponsored.");
  
    const donorId = 1;
  
    fetch(`http://localhost:5000/donors/${donorId}/sponsor/${studentId}`, {
      method: "POST"
    })
      .then(res => res.text().then(msg => {
        if (!res.ok) {
          alert("❌ " + msg);
        } else {
          alert("✅ " + msg);
          location.reload(); // Refresh UI to update sponsored status
        }
      }))
      .catch(err => {
        console.error("❌ Sponsor error:", err);
        alert("❌ Could not sponsor student due to server error");
      });
  }
  
  function trackFundUsage() {
    const studentId = document.getElementById("fundStudentId").value;
    if (!studentId) return alert("❌ Please select a student to track fund usage.");
  
    fetch(`http://localhost:5000/funds/${studentId}`)
      .then(res => res.json())
      .then(data => {
        const display = data.length
          ? data.map(f => `📌 ${f.purpose}: ₹${f.amount}`).join("<br>")
          : "ℹ️ No fund data available.";
        document.getElementById("fundResult").innerHTML = display;
      })
      .catch(err => {
        console.error("❌ Fund tracking error:", err);
        alert("❌ Error fetching fund data.");
      });
  }
  