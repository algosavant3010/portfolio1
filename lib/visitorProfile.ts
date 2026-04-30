// lib/visitorProfile.ts — Visitor classification and cookie management
import type { VisitorType } from './store';

/**
 * Read visitor type from cookie.
 */
export function getVisitorFromCookie(): VisitorType {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/visitor_type=(\w+)/);
  if (!match) return null;
  const val = match[1];
  if (val === 'recruiter' || val === 'engineer' || val === 'explorer') return val;
  return null;
}

/**
 * Classify visitor based on their multiple-choice answers.
 * answers: array of selected option indices from the intro quiz.
 */
export function classifyVisitor(answers: number[]): VisitorType {
  // Q1: What brings you here? 0=hiring, 1=tech curiosity, 2=just browsing
  // Q2: What interests you most? 0=experience/leadership, 1=code/architecture, 2=creative work
  const hiringSignals = answers.filter((a) => a === 0).length;
  const techSignals = answers.filter((a) => a === 1).length;

  if (hiringSignals >= 1) return 'recruiter';
  if (techSignals >= 1) return 'engineer';
  return 'explorer';
}

/**
 * Get content emphasis based on visitor type.
 * Controls which aspects of the portfolio to highlight.
 */
export function getContentEmphasis(type: VisitorType) {
  switch (type) {
    case 'recruiter':
      return {
        showLeadership: true,
        showDeepTech: false,
        highlightProjects: ['nyayaflow', 'spendify', 'portfolio'],
        greeting: "Welcome! I'd love to tell you about my projects and what I can bring to your team.",
      };
    case 'engineer':
      return {
        showLeadership: false,
        showDeepTech: true,
        highlightProjects: ['nyayaflow', 'spendify', 'portfolio'],
        greeting: "Hey, fellow dev! Let's dive into the technical details.",
      };
    default:
      return {
        showLeadership: false,
        showDeepTech: false,
        highlightProjects: ['portfolio', 'nyayaflow', 'spendify'],
        greeting: "Hey there! Feel free to explore — ask me anything.",
      };
  }
}
