/**
 * PDF Export Module - Generates printable PDF from plan data
 */

const PDFExport = {
  /**
   * Generate and download PDF
   */
  generate() {
    const user = Storage.getUser();
    const vision = Storage.getVision();
    const focusAreas = Storage.getFocusAreas();
    const quarterly = Storage.getQuarterly();
    const whimsy = Storage.getWhimsy();

    // Create print window
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow popups to export your plan as PDF.');
      return;
    }

    const html = this.generateHTML(user, vision, focusAreas, quarterly, whimsy);
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  },

  /**
   * Generate HTML for PDF
   */
  generateHTML(user, vision, focusAreas, quarterly, whimsy) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Life Plan - ${this.escapeHtml(user.name)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #404345;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    h1, h2, h3, h4 {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      color: #3C5F6A;
      margin-bottom: 12px;
    }

    h1 {
      font-size: 24pt;
      text-align: center;
      margin-bottom: 8px;
    }

    h2 {
      font-size: 16pt;
      border-bottom: 2px solid #3C5F6A;
      padding-bottom: 8px;
      margin-top: 30px;
    }

    h3 {
      font-size: 13pt;
      color: #958B8F;
      margin-top: 20px;
    }

    h4 {
      font-size: 11pt;
      margin-top: 15px;
    }

    p {
      margin-bottom: 10px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E8E8E8;
    }

    .header .subtitle {
      color: #9B9B9B;
      font-size: 10pt;
    }

    .header .date {
      color: #9B9B9B;
      font-size: 9pt;
      margin-top: 10px;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .vision-statement {
      background-color: #f8f9fa;
      padding: 20px;
      border-left: 4px solid #3C5F6A;
      font-style: italic;
      font-size: 12pt;
      margin: 20px 0;
    }

    .bubble-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0;
    }

    .bubble {
      display: inline-block;
      padding: 6px 12px;
      background-color: rgba(161, 212, 216, 0.3);
      border: 1px solid #A1D4D8;
      border-radius: 20px;
      font-size: 9pt;
    }

    .focus-area {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      page-break-inside: avoid;
    }

    .focus-area-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .focus-area-emoji {
      font-size: 20pt;
    }

    .focus-area-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 12pt;
      color: #3C5F6A;
    }

    .focus-area-description {
      color: #9B9B9B;
      font-size: 10pt;
      margin-bottom: 10px;
    }

    .action-list {
      list-style: none;
      padding-left: 0;
    }

    .action-list li {
      padding: 6px 0;
      padding-left: 20px;
      position: relative;
      font-size: 10pt;
    }

    .action-list li::before {
      content: "\\2713";
      position: absolute;
      left: 0;
      color: #7CB342;
    }

    .quarterly-section {
      margin: 15px 0;
    }

    .quarter-header {
      background-color: #3C5F6A;
      color: white;
      padding: 8px 15px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 11pt;
    }

    .quarter-content {
      padding: 15px;
      border: 1px solid #E8E8E8;
      border-top: none;
    }

    .quarterly-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #E8E8E8;
    }

    .quarterly-item:last-child {
      border-bottom: none;
    }

    .quarterly-checkbox {
      width: 16px;
      height: 16px;
      border: 2px solid #E8E8E8;
      border-radius: 3px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .quarterly-checkbox.checked {
      background-color: #7CB342;
      border-color: #7CB342;
    }

    .quarterly-text {
      flex: 1;
    }

    .quarterly-focus {
      font-size: 9pt;
      color: #9B9B9B;
    }

    .whimsy-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #E8E8E8;
    }

    .whimsy-item:last-child {
      border-bottom: none;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E8E8E8;
      color: #9B9B9B;
      font-size: 9pt;
    }

    .footer-brand {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      color: #3C5F6A;
    }

    @media print {
      body {
        padding: 20px;
      }

      .section {
        page-break-inside: avoid;
      }

      h2 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${this.escapeHtml(user.name)}'s ${user.planningYear || new Date().getFullYear()} Life Plan</h1>
    <p class="subtitle">Strategic Planning for Your Life</p>
    <p class="date">Generated on ${date}</p>
  </div>

  ${this.renderVisionSection(vision)}
  ${this.renderFocusAreasSection(focusAreas, vision)}
  ${this.renderReflectionsSection(vision)}
  ${this.renderQuarterlySection(quarterly, focusAreas)}
  ${this.renderWhimsySection(whimsy)}

  <div class="footer">
    <p class="footer-brand">Clover Advisory</p>
    <p>www.cloveradvisory.com</p>
    <p>&copy; 2025 Clover Advisory. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  },

  /**
   * Render vision section
   */
  renderVisionSection(vision) {
    let html = '<div class="section"><h2>Life Vision</h2>';

    if (vision.lifeVisionStatement) {
      html += `<div class="vision-statement">"${this.escapeHtml(vision.lifeVisionStatement)}"</div>`;
    }

    if (vision.lifeVisionIdeas && vision.lifeVisionIdeas.length > 0) {
      html += '<h3>Vision Ideas</h3><div class="bubble-list">';
      vision.lifeVisionIdeas.forEach(item => {
        html += `<span class="bubble">${this.escapeHtml(item.text)}</span>`;
      });
      html += '</div>';
    }

    html += '</div>';

    // Current State Baseline
    if ((vision.highMarks && vision.highMarks.length > 0) || (vision.regrets && vision.regrets.length > 0)) {
      html += '<div class="section"><h2>Current State Baseline</h2>';

      if (vision.highMarks && vision.highMarks.length > 0) {
        html += '<h3>Where I\'ve Succeeded</h3><div class="bubble-list">';
        vision.highMarks.forEach(item => {
          html += `<span class="bubble" style="background-color: rgba(124, 179, 66, 0.2); border-color: #7CB342;">${this.escapeHtml(item.text)}</span>`;
        });
        html += '</div>';
      }

      if (vision.regrets && vision.regrets.length > 0) {
        html += '<h3>Areas for Growth</h3><div class="bubble-list">';
        vision.regrets.forEach(item => {
          html += `<span class="bubble" style="background-color: rgba(149, 139, 143, 0.2); border-color: #958B8F;">${this.escapeHtml(item.text)}</span>`;
        });
        html += '</div>';
      }

      html += '</div>';
    }

    return html;
  },

  /**
   * Render focus areas section
   */
  renderFocusAreasSection(focusAreas, vision) {
    if (focusAreas.length === 0) return '';

    let html = `<div class="section"><h2>Focus Areas (${vision.yearsFromNow || 5} Year Goals)</h2>`;

    focusAreas.forEach(area => {
      html += `
        <div class="focus-area">
          <div class="focus-area-header">
            ${area.emoji ? `<span class="focus-area-emoji">${area.emoji}</span>` : ''}
            <span class="focus-area-title">${this.escapeHtml(area.title || 'Untitled')}</span>
          </div>
          ${area.description ? `<p class="focus-area-description">${this.escapeHtml(area.description)}</p>` : ''}
      `;

      if (area.topActions && area.topActions.length > 0) {
        html += '<h4>Top Priorities</h4><ul class="action-list">';
        area.topActions.forEach(action => {
          html += `<li>${this.escapeHtml(action)}</li>`;
        });
        html += '</ul>';
      }

      if (area.actions && area.actions.length > 0) {
        html += '<h4>All Actions</h4><div class="bubble-list">';
        area.actions.forEach(action => {
          html += `<span class="bubble">${this.escapeHtml(action.text)}</span>`;
        });
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div>';
    return html;
  },

  /**
   * Render reflections section
   */
  renderReflectionsSection(vision) {
    if ((!vision.proudOf || vision.proudOf.length === 0) &&
        (!vision.learnings || vision.learnings.length === 0) &&
        (!vision.barriers || vision.barriers.length === 0)) {
      return '';
    }

    let html = '<div class="section"><h2>Annual Reflections</h2>';

    if (vision.proudOf && vision.proudOf.length > 0) {
      html += '<h3>What I\'m Proud Of</h3><div class="bubble-list">';
      vision.proudOf.forEach(item => {
        html += `<span class="bubble">${this.escapeHtml(item.text)}</span>`;
      });
      html += '</div>';
    }

    if (vision.learnings && vision.learnings.length > 0) {
      html += '<h3>Key Learnings</h3><div class="bubble-list">';
      vision.learnings.forEach(item => {
        html += `<span class="bubble">${this.escapeHtml(item.text)}</span>`;
      });
      html += '</div>';
    }

    if (vision.barriers && vision.barriers.length > 0) {
      html += '<h3>Barriers to Address</h3><div class="bubble-list">';
      vision.barriers.forEach(item => {
        html += `<span class="bubble">${this.escapeHtml(item.text)}</span>`;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  /**
   * Render quarterly section
   */
  renderQuarterlySection(quarterly, focusAreas) {
    // Build actions by timing from focusAreas (same logic as dashboard)
    const actionsByTiming = { q1: [], q2: [], q3: [], q4: [], might: [] };

    focusAreas.forEach(area => {
      const actionTimings = area.actionTimings || {};
      const actionStatuses = area.actionStatuses || {};
      const noSubStepsFlags = area.noSubStepsFlags || {};
      const actionSubSteps = area.actionSubSteps || {};
      const actionFinalMilestones = area.actionFinalMilestones || {};
      const prioritizedActions = area.prioritizedActions || [];
      const allActions = (area.actions || []).map(a => a.text);

      // Get all strategies
      const allStrategies = [
        ...prioritizedActions,
        ...allActions.filter(a => !prioritizedActions.includes(a))
      ];

      // For each strategy, get its action items
      allStrategies.forEach(strategyText => {
        const hasNoSubSteps = noSubStepsFlags[strategyText] === true;
        const subSteps = actionSubSteps[strategyText] || [];
        const finalMilestone = actionFinalMilestones[strategyText] || '';

        let actionItems = [];
        if (hasNoSubSteps || (subSteps.length === 0 && !finalMilestone)) {
          actionItems = [strategyText];
        } else {
          actionItems = [...subSteps];
          if (finalMilestone) {
            actionItems.push(finalMilestone);
          }
        }

        // Add each action item to the appropriate timing category
        actionItems.forEach(actionText => {
          const timing = actionTimings[actionText];
          if (timing && actionsByTiming[timing]) {
            actionsByTiming[timing].push({
              text: actionText,
              focusAreaId: area.id,
              focusAreaTitle: area.title,
              focusAreaEmoji: area.emoji,
              status: actionStatuses[actionText] || 'not-started'
            });
          }
        });
      });
    });

    const hasActions = Object.values(actionsByTiming).some(q => q.length > 0);
    if (!hasActions) return '';

    const timingLabels = {
      q1: 'Q1 (Jan-Mar)',
      q2: 'Q2 (Apr-Jun)',
      q3: 'Q3 (Jul-Sep)',
      q4: 'Q4 (Oct-Dec)',
      might: 'Might Do'
    };

    let html = '<div class="section"><h2>Quarterly Roadmap</h2>';

    ['q1', 'q2', 'q3', 'q4', 'might'].forEach(timing => {
      const actions = actionsByTiming[timing];
      if (actions.length === 0) return;

      html += `
        <div class="quarterly-section">
          <div class="quarter-header">${timingLabels[timing]}</div>
          <div class="quarter-content">
      `;

      actions.forEach(action => {
        const isComplete = action.status === 'complete';

        html += `
          <div class="quarterly-item">
            <div class="quarterly-checkbox ${isComplete ? 'checked' : ''}"></div>
            <div class="quarterly-text">
              <div>${this.escapeHtml(action.text)}</div>
              <div class="quarterly-focus">${action.focusAreaEmoji || ''} ${this.escapeHtml(action.focusAreaTitle)}</div>
            </div>
          </div>
        `;
      });

      html += '</div></div>';
    });

    html += '</div>';
    return html;
  },

  /**
   * Render whimsy section
   */
  renderWhimsySection(whimsy) {
    if (!whimsy || whimsy.length === 0) return '';

    const emojis = ['✨', '🌟', '💫', '🎯', '🚀', '🎨', '🎭', '🎪', '🎢', '🌈'];

    let html = '<div class="section"><h2>Whimsy List</h2><p style="color: #9B9B9B; font-size: 10pt; margin-bottom: 15px;">Things that sound fun, challenging, or just plain whimsical.</p>';

    whimsy.forEach((item, index) => {
      const emoji = emojis[index % emojis.length];
      html += `
        <div class="whimsy-item">
          <span>${emoji}</span>
          <span>${this.escapeHtml(item.text)}</span>
        </div>
      `;
    });

    html += '</div>';
    return html;
  },

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Make PDFExport globally available
window.PDFExport = PDFExport;
