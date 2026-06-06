import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import bcrypt from 'bcryptjs';
import logo from './assets/logo.png';
import { FaPlus } from 'react-icons/fa';
import {
  FaUsers, FaMale, FaFemale, FaWheelchair, FaGraduationCap, FaRegFileAlt,
  FaChartBar, FaTable, FaDownload, FaSignOutAlt, FaUserShield, FaBuilding,
  FaUserTie, FaCertificate, FaEye, FaTimes, FaArrowLeft, FaArrowRight,
  FaUser, FaLock, FaCheck, FaClipboardList, FaBriefcase, FaBook, FaChalkboardTeacher,
  FaExclamationTriangle, FaEnvelope, FaIdCard, FaCalendarAlt, FaSort,
  FaSortUp, FaSortDown, FaFilter, FaSearch, FaChartLine, FaChartPie,
  FaRegCalendarAlt, FaClock, FaArrowUp, FaPercent, FaTrash, FaSpinner,
  FaQuestionCircle, FaBan, FaPrint, FaEyeSlash, FaInfoCircle, FaSave,
  FaDatabase, FaFileExport, FaRegCheckCircle
} from 'react-icons/fa';
import { MdAnalytics, MdRecordVoiceOver, MdTimeline } from 'react-icons/md';
import {
  LineChart, Line, BarChart as ReBarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

const LOGO = logo;

const DEPARTMENTS = ["Electrical", "Built Environment", "AutoCP", "Mechanical", "Computing and Informatics", "Aeronautical"];
const DESIGNATIONS = ["Full Time Lecturer", "Support Staff", "Part Time Lecturer", "Intern", "Teaching Practice"];
const JOB_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STEPS = ["Personal", "Employment", "Qualifications", "Prof. Dev", "Review"];

const parseDateString = (dateStr) => {
  if (!dateStr) return { day: "", month: "", year: "" };
  const [y, m, d] = dateStr.split("-");
  const monthIndex = parseInt(m, 10) - 1;
  const monthName = MONTHS[monthIndex] || "";
  return {
    day: parseInt(d, 10).toString(),
    month: monthName,
    year: y
  };
};

const formatDateString = (day, month, year) => {
  if (!day || !month || !year) return "";
  const monthIndex = MONTHS.indexOf(month);
  if (monthIndex === -1) return "";
  const mStr = String(monthIndex + 1).padStart(2, '0');
  const dStr = String(day).padStart(2, '0');
  return `${year}-${mStr}-${dStr}`;
};

// ALL EXPORT COLUMNS
const EXPORT_COLUMNS = [
  ["Full Name", "full_name"], ["Email", "email"], ["Gender", "gender"], ["National ID", "national_id"],
  ["DOB Day", "dob_day"], ["DOB Month", "dob_month"], ["DOB Year", "dob_year"],
  ["Disability", "disability"], ["Disability Nature", "disability_nature"],
  ["Job Group", "job_group"], ["Designation", "designation"], ["Department", "department"],
  ["Personal Number", "personal_number"],
  ["Appointment Day", "appointment_day"], ["Appointment Month", "appointment_month"], ["Appointment Year", "appointment_year"],
  ["Retirement/Expiry Day", "retirement_day"], ["Retirement/Expiry Month", "retirement_month"], ["Retirement/Expiry Year", "retirement_year"],
  ["Duties & Roles", "duties_roles"], ["Responsibilities", "responsibilities"],
  ["KCSE Year", "kcse_year"], ["KCSE Grade", "kcse_grade"],
  ["Certificate Name", "cert_name"], ["Certificate Year", "cert_year"], ["Certificate Grade", "cert_grade"],
  ["Diploma Name", "diploma_name"], ["Diploma Year", "diploma_year"], ["Diploma Grade", "diploma_grade"],
  ["Higher Diploma Name", "hdip_name"], ["Higher Diploma Year", "hdip_year"], ["Higher Diploma Grade", "hdip_grade"],
  ["Degree Name", "degree_name"], ["Degree Year", "degree_year"], ["Degree Grade", "degree_grade"],
  ["Masters Name", "masters_name"], ["Masters Year", "masters_year"], ["Masters Grade", "masters_grade"],
  ["PhD Name", "phd_name"], ["PhD Year", "phd_year"], ["PhD Grade", "phd_grade"],
  ["Pedagogy Year", "pedagogy_year"], ["Pedagogy Grade", "pedagogy_grade"],
  ["ToT Year", "tot_year"], ["ToT Grade", "tot_grade"],
  ["Supervisory Year", "superv_year"], ["Supervisory Grade", "superv_grade"],
  ["Senior Management Year", "senior_mgmt_year"], ["Senior Management Grade", "senior_mgmt_grade"],
  ["SLDP Year", "sldp_year"], ["SLDP Grade", "sldp_grade"],
  ["Retirement Course Year", "retire_course_year"], ["Retirement Course Grade", "retire_course_grade"],
  ["Other Courses", "other_courses"],
  ["TVETA Reg No.", "tveta_reg_no"], ["TVETA Date Registered", "tveta_date"], ["TVETA Expiry", "tveta_expiry"],
  ["Submitted At", "submitted_at"],
];

const C = {
  primary: "#1B3A2D",
  accent: "#C8922A",
  accent2: "#8B1A1A",
  light: "#EFF4F1",
  bg: "#F3F5F2",
  white: "#FFFFFF",
  text: "#1A2A22",
  muted: "#5A7060",
  border: "#C8D4CB",
  success: "#1B5E36",
  danger: "#9B1C1C",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const COLORS = ['#1B3A2D', '#C8922A', '#8B1A1A', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Georgia', serif; background: ${C.bg}; color: ${C.text}; -webkit-tap-highlight-color: transparent; }
.app { min-height: 100vh; }

.header { background: ${C.primary}; color: #fff; border-bottom: 4px solid ${C.accent}; position: sticky; top: 0; z-index: 50; }
.header-inner { max-width: 1100px; margin: 0 auto; padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; min-height: 64px; gap: 8px; }
.header-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 1; min-width: 0; }
.header-logo img { width: 40px; height: 40px; object-fit: contain; background: transparent; }
.header-title { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.06em; line-height: 1.2; }
.header-sub { font-size: 0.55rem; opacity: 0.75; letter-spacing: 0.1em; text-transform: uppercase; font-family: sans-serif; }
.header-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }

.container { max-width: 860px; margin: 0 auto; padding: 1rem; }
.container-wide { max-width: 1400px; margin: 0 auto; padding: 1rem; }

.card { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card-sm { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 10px; padding: 0.875rem 1rem; }

.sec-title { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.accent}; font-family: sans-serif; font-weight: 700; margin-bottom: 0.875rem; padding-bottom: 6px; border-bottom: 2px solid ${C.accent}; display: flex; align-items: center; gap: 8px; }

.field { display: flex; flex-direction: column; gap: 4px; }
.label { font-size: 0.72rem; font-weight: 600; color: ${C.muted}; font-family: sans-serif; letter-spacing: 0.02em; display: flex; align-items: center; gap: 6px; }
input, select, textarea { border: 1px solid ${C.border}; border-radius: 8px; padding: 10px 12px; font-size: 0.88rem; font-family: sans-serif; background: ${C.white}; color: ${C.text}; outline: none; width: 100%; transition: border-color 0.15s; -webkit-appearance: none; }
input:focus, select:focus, textarea:focus { border-color: ${C.primary}; }
textarea { min-height: 80px; resize: vertical; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; margin-bottom: 0.875rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; margin-bottom: 0.875rem; }
.grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.875rem; margin-bottom: 0.875rem; }
.grid-stat { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 1.25rem; }

.btn { background: ${C.primary}; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 0.85rem; font-family: sans-serif; cursor: pointer; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; touch-action: manipulation; }
.btn:hover { opacity: 0.9; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn-accent { background: ${C.accent}; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 0.85rem; font-family: sans-serif; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; touch-action: manipulation; }
.btn-outline { background: transparent; color: ${C.primary}; border: 1.5px solid ${C.primary}; border-radius: 8px; padding: 8px 16px; font-size: 0.8rem; font-family: sans-serif; cursor: pointer; font-weight: 600; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; touch-action: manipulation; }
.btn-outline:active { background: ${C.light}; }
.btn-danger { background: ${C.danger}; color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 0.8rem; font-family: sans-serif; cursor: pointer; font-weight: 600; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; touch-action: manipulation; }
.btn-ghost { background: transparent; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.35); border-radius: 8px; padding: 6px 12px; font-size: 0.75rem; font-family: sans-serif; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; touch-action: manipulation; }
.btn-icon { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; color: ${C.muted}; touch-action: manipulation; }
.btn-icon:active { background: ${C.light}; transform: scale(0.95); }

.steps { display: flex; gap: 4px; margin-bottom: 1.25rem; overflow-x: auto; padding-bottom: 6px; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
.steps::-webkit-scrollbar { height: 3px; }
.steps::-webkit-scrollbar-track { background: ${C.border}; border-radius: 3px; }
.steps::-webkit-scrollbar-thumb { background: ${C.primary}; border-radius: 3px; }
.step-item { flex: 1; min-width: 65px; padding: 8px 3px; text-align: center; font-size: 0.65rem; font-weight: 600; border-radius: 8px; font-family: sans-serif; white-space: nowrap; transition: all 0.2s; border: 1.5px solid ${C.border}; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
.step-active { background: ${C.primary}; color: #fff; border-color: ${C.primary}; }
.step-done { background: ${C.success}; color: #fff; border-color: ${C.success}; }
.step-idle { background: ${C.light}; color: ${C.muted}; }

.alert-success, .alert-danger, .alert-warning { border-radius: 10px; padding: 0.875rem 1rem; font-size: 0.82rem; font-family: sans-serif; margin-bottom: 0.875rem; display: flex; align-items: flex-start; gap: 8px; word-break: break-word; }

.stat-card { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; cursor: pointer; touch-action: manipulation; }
.stat-card:active { transform: scale(0.98); }
.stat-icon { font-size: 1.4rem; flex-shrink: 0; display: flex; align-items: center; }
.stat-label { font-family: sans-serif; font-size: 0.65rem; color: ${C.muted}; text-transform: uppercase; letter-spacing: 0.08em; }
.stat-val { font-family: sans-serif; font-size: 1.5rem; font-weight: 700; color: ${C.primary}; line-height: 1.2; }

.tbl { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 0.75rem; }
.tbl th { padding: 10px 8px; text-align: left; color: ${C.muted}; font-weight: 700; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; background: ${C.light}; white-space: nowrap; cursor: pointer; user-select: none; touch-action: manipulation; }
.tbl td { padding: 10px 8px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }

.rev-row { display: flex; border-bottom: 1px solid ${C.border}; padding: 10px 0; font-family: sans-serif; font-size: 0.82rem; gap: 8px; }
.rev-key { width: 130px; flex-shrink: 0; color: ${C.muted}; font-weight: 600; display: flex; align-items: flex-start; gap: 6px; }
.rev-val { color: ${C.text}; flex: 1; word-break: break-word; }

.nav-bar { background: ${C.white}; border-bottom: 1px solid ${C.border}; padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.nav-tabs { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
.nav-user { display: flex; align-items: center; gap: 10px; font-family: sans-serif; font-size: 0.8rem; flex-wrap: wrap; }

.date-row { display: flex; gap: 6px; flex-wrap: wrap; }
.date-dd { width: 60px; flex-shrink: 0; }
.date-mm { flex: 1; min-width: 100px; }
.date-yy { width: 70px; flex-shrink: 0; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; padding: 0; overflow-y: auto; }
.modal { background: ${C.white}; border-radius: 16px 16px 0 0; max-width: 700px; width: 100%; margin: auto; padding: 1.25rem; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; gap: 10px; flex-wrap: wrap; }
.modal-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

.qual-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid ${C.border}; }
.qual-label { font-family: sans-serif; font-size: 0.82rem; font-weight: 700; color: ${C.primary}; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }

.badge { background: ${C.light}; padding: 4px 10px; border-radius: 20px; font-size: 0.72rem; font-family: sans-serif; color: ${C.primary}; font-weight: 600; display: inline-block; }
.badge-accent { background: ${C.accent}; color: #fff; font-size: 0.68rem; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase; font-family: sans-serif; display: inline-flex; align-items: center; gap: 4px; }
.badge-green { background: #d1fae5; color: ${C.success}; padding: 3px 8px; border-radius: 6px; font-size: 0.68rem; font-family: sans-serif; font-weight: 600; display: inline-flex; align-items: center; gap: 3px; }

.filter-bar { display: flex; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; align-items: flex-end; }
.filter-group { flex: 1; min-width: 160px; }
.search-wrap { position: relative; flex: 1; min-width: 160px; }
.search-wrap input { padding-left: 34px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${C.muted}; font-size: 0.85rem; pointer-events: none; }

.chart-container { background: ${C.white}; border-radius: 12px; padding: 0.875rem; margin-bottom: 1rem; overflow-x: auto; }

.password-wrapper { position: relative; }
.password-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 6px; color: ${C.muted}; transition: all 0.2s; touch-action: manipulation; }
.password-toggle:active { transform: translateY(-50%) scale(0.95); }

/* Toast Notification */
.toast-notification { position: fixed; bottom: 20px; right: 20px; z-index: 2000; animation: slideInRight 0.3s ease; }
.toast-success { background: ${C.success}; color: #fff; padding: 12px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif; font-size: 0.85rem; font-weight: 500; }
.toast-error { background: ${C.danger}; color: #fff; padding: 12px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif; font-size: 0.85rem; font-weight: 500; }

/* Mobile Records Cards */
.rec-card { background: ${C.white}; border: 1px solid ${C.border}; border-radius: 12px; padding: 0.875rem; margin-bottom: 0.75rem; }
.rec-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 0.75rem; }
.rec-avatar { width: 40px; height: 40px; border-radius: 50%; background: ${C.light}; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; color: ${C.primary}; flex-shrink: 0; }
.rec-card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; font-family: sans-serif; font-size: 0.75rem; margin-bottom: 0.75rem; }
.rec-field-lbl { color: ${C.muted}; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.rec-field-val { color: ${C.text}; font-weight: 500; word-break: break-word; }
.rec-card-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }

/* Custom Alert Modal */
.alert-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.alert-modal { background: ${C.white}; border-radius: 16px; max-width: 400px; width: 100%; padding: 1.5rem; text-align: center; animation: fadeIn 0.2s ease; }
.alert-modal-icon { font-size: 48px; margin-bottom: 1rem; }
.alert-modal-title { font-family: sans-serif; font-size: 1.2rem; font-weight: 700; color: ${C.warning}; margin-bottom: 0.5rem; }
.alert-modal-message { font-family: sans-serif; font-size: 0.9rem; color: ${C.text}; margin-bottom: 1rem; line-height: 1.4; }
.alert-modal-buttons { display: flex; gap: 12px; justify-content: center; }
.alert-modal-btn { padding: 8px 20px; border-radius: 8px; font-family: sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
.alert-modal-btn-cancel { background: ${C.light}; color: ${C.muted}; }
.alert-modal-btn-cancel:hover { background: ${C.border}; }
.alert-modal-btn-confirm { background: ${C.warning}; color: #fff; }
.alert-modal-btn-confirm:hover { background: ${C.danger}; }

/* Print Styles */
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .print-page { padding: 0; margin: 0; }
  .print-header { display: flex; align-items: center; gap: 14px; padding-bottom: 10px; border-bottom: 3px solid #C8922A; margin-bottom: 14px; }
  .print-header img { width: 54px; height: 54px; object-fit: contain; }
  .print-header-text h1 { font-size: 13pt; color: #1B3A2D; margin-bottom: 2px; }
  .print-header-text p { font-size: 8pt; color: #555; letter-spacing: 0.08em; text-transform: uppercase; }
  .print-name-bar { background: #1B3A2D; color: #fff; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
  .print-name-bar h2 { font-size: 12pt; margin: 0; }
  .print-name-bar span { font-size: 9pt; opacity: 0.8; }
  .print-badges { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
  .print-badge { background: #EFF4F1; border: 1px solid #C8D4CB; padding: 2px 8px; border-radius: 4px; font-size: 8pt; font-family: sans-serif; color: #1B3A2D; }
  .print-section { margin-bottom: 12px; page-break-inside: avoid; }
  .print-section-title { font-family: sans-serif; font-size: 7.5pt; letter-spacing: 0.15em; text-transform: uppercase; color: #C8922A; font-weight: 700; border-bottom: 1.5px solid #C8922A; padding-bottom: 3px; margin-bottom: 6px; }
  .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
  .print-row { display: flex; padding: 3px 0; border-bottom: 1px solid #e5e5e5; font-size: 9.5pt; }
  .print-key { width: 160px; flex-shrink: 0; color: #666; font-size: 8.5pt; }
  .print-val { color: #111; font-weight: 600; }
  .print-footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #ccc; font-family: sans-serif; font-size: 7.5pt; color: #888; display: flex; justify-content: space-between; }
}
.print-only { display: none; }

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Responsive Breakpoints */
@media (max-width: 480px) {
  .header-logo img { width: 32px; height: 32px; }
  .header-title { font-size: 0.7rem; }
  .header-sub { display: none; }
  .header-inner { min-height: 52px; padding: 0 0.75rem; }
  .btn, .btn-accent { padding: 8px 14px; font-size: 0.8rem; }
  .btn-outline { padding: 6px 12px; font-size: 0.75rem; }
  .step-item { min-width: 55px; font-size: 0.58rem; padding: 6px 2px; }
  .grid-stat { grid-template-columns: 1fr; gap: 10px; }
  .stat-val { font-size: 1.3rem; }
  .stat-icon { font-size: 1.2rem; }
  .modal { padding: 1rem; }
  .rev-key { width: 110px; font-size: 0.72rem; }
  .rev-val { font-size: 0.78rem; }
  .container, .container-wide { padding: 0.75rem; }
  .card { padding: 0.875rem; }
  .filter-group { min-width: 100%; }
  .search-wrap { min-width: 100%; }
  .btn-ghost { padding: 5px 10px; font-size: 0.7rem; }
  .toast-notification { bottom: 10px; right: 10px; left: 10px; }
  .toast-success, .toast-error { justify-content: center; }
}

@media (max-width: 768px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-bar .filter-group { width: 100%; }
  .filter-bar .search-wrap { width: 100%; }
  .nav-bar { padding: 0.7rem 0.875rem; flex-direction: column; }
  .nav-tabs { width: 100%; justify-content: center; }
  .nav-user { width: 100%; justify-content: center; }
  .stat-val { font-size: 1.4rem; }
  .qual-row { grid-template-columns: 1fr 1fr; }
  .qual-row .qual-name { grid-column: 1 / -1; }
  .tbl-hide-mobile { display: none; }
  .show-tbl { display: none; }
  .show-cards { display: block; }
  .modal { padding: 1rem 0.875rem; border-radius: 16px 16px 0 0; max-height: 85vh; }
  .overlay { align-items: flex-end; }
  .modal-header { flex-direction: column; align-items: stretch; }
  .modal-actions { justify-content: flex-end; }
  .date-row { flex-wrap: wrap; }
  .date-dd, .date-mm, .date-yy { width: 100%; }
  .chart-container { padding: 0.75rem; }
  .chart-container .recharts-wrapper { font-size: 10px; }
}

@media (min-width: 769px) {
  .show-cards { display: none; }
  .show-tbl { display: block; }
  .overlay { align-items: center; padding: 1rem; }
  .modal { border-radius: 16px; max-height: 90vh; }
}

@media (min-width: 1200px) {
  .container-wide { max-width: 1600px; }
  .grid-stat { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
}

@media (hover: none) and (pointer: coarse) {
  .btn, .btn-outline, .btn-accent, .btn-danger, .btn-icon, .stat-card, .step-item {
    cursor: default;
  }
  input, select, textarea, button {
    font-size: 16px;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin { animation: spin 0.75s linear infinite; }

.text-center { text-align: center; }
.w-100 { width: 100%; }
.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
`;

const emptyForm = () => ({
  fullName: "", email: "", gender: "", nationalId: "", dobDay: "", dobMonth: "", dobYear: "",
  jobGroup: "", disability: "", disabilityNature: "",
  appointmentDay: "", appointmentMonth: "", appointmentYear: "",
  retirementDay: "", retirementMonth: "", retirementYear: "",
  designation: "", department: "", dutiesRoles: "", responsibilities: "",
  personalNumber: "",
  kcseYear: "", kcseGrade: "",
  certName: "", certYear: "", certGrade: "",
  diplomaName: "", diplomaYear: "", diplomaGrade: "",
  hdipName: "", hdipYear: "", hdipGrade: "",
  degreeName: "", degreeYear: "", degreeGrade: "",
  mastersName: "", mastersYear: "", mastersGrade: "",
  phdName: "", phdYear: "", phdGrade: "",
  pedagogyYear: "", pedagogyGrade: "",
  totYear: "", totGrade: "",
  supervYear: "", supervGrade: "",
  seniorMgmtYear: "", seniorMgmtGrade: "",
  sldpYear: "", sldpGrade: "",
  retireCourseYear: "", retireCourseGrade: "",
  otherCourses: [],  // will hold array of { desc, year, grade }
  tvetaDate: "", tvetaExpiry: "", tvetaRegNo: "",
});

function DateFields({ prefix, label, form, onChange, required }) {
  const dateValue = formatDateString(form[prefix + "Day"], form[prefix + "Month"], form[prefix + "Year"]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) {
      onChange(prefix + "Day", "");
      onChange(prefix + "Month", "");
      onChange(prefix + "Year", "");
      return;
    }
    const { day, month, year } = parseDateString(val);
    onChange(prefix + "Day", day);
    onChange(prefix + "Month", month);
    onChange(prefix + "Year", year);
  };

  return (
    <div className="field">
      <label className="label"><FaCalendarAlt size={12} /> {label}{required && " *"}</label>
      <input
        type="date"
        value={dateValue}
        onChange={handleDateChange}
        style={{ fontFamily: "sans-serif" }}
      />
    </div>
  );
}

// ── PRINT RECORD COMPONENT ──
function PrintRecord({ r }) {
  const fmtDate = (d, m, y) => [d, m, y].filter(Boolean).join(" ");
  const row = (k, v) => v ? (
    <div className="print-row" key={k}>
      <span className="print-key">{k}</span>
      <span className="print-val">{v}</span>
    </div>
  ) : null;

  return (
    <div className="print-only print-page" id="print-record">
      <div className="print-header">
        <img src={LOGO} alt="NYS" />
        <div className="print-header-text">
          <h1>National Youth Service Engineering Institute</h1>
          <p>Staff Personal Record — Confidential</p>
        </div>
      </div>

      <div className="print-name-bar">
        <h2>{r.full_name}</h2>
        <span>Printed: {new Date().toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" })}</span>
      </div>

      <div className="print-badges">
        {r.designation && <span className="print-badge">{r.designation}</span>}
        {r.department && <span className="print-badge">{r.department}</span>}
        {r.job_group && <span className="print-badge">Job Group: {r.job_group}</span>}
        {r.personal_number && <span className="print-badge">Personal No: {r.personal_number}</span>}
        {r.tveta_reg_no && <span className="print-badge">TVETA: {r.tveta_reg_no}</span>}
      </div>

      <div className="print-section">
        <div className="print-section-title">Personal Information</div>
        <div className="print-grid">
          {row("Full Name", r.full_name)}
          {row("Email", r.email)}
          {row("Gender", r.gender)}
          {row("National ID No.", r.national_id)}
          {row("Date of Birth", fmtDate(r.dob_day, r.dob_month, r.dob_year))}
          {row("Disability", r.disability)}
          {row("Disability Nature", r.disability_nature)}
        </div>
      </div>

      <div className="print-section">
        <div className="print-section-title">Employment Details</div>
        <div className="print-grid">
          {row("Designation", r.designation)}
          {row("Department", r.department)}
          {row("Personal Number", r.personal_number)}
          {row("Job Group", r.job_group)}
          {row("Date of Appointment", fmtDate(r.appointment_day, r.appointment_month, r.appointment_year))}
          {row("Retirement / Expiry", fmtDate(r.retirement_day, r.retirement_month, r.retirement_year))}
        </div>
        {r.duties_roles && <div className="print-row"><span className="print-key">Duties & Roles</span><span className="print-val">{r.duties_roles}</span></div>}
        {r.responsibilities && <div className="print-row"><span className="print-key">Responsibilities</span><span className="print-val">{r.responsibilities}</span></div>}
      </div>

      <div className="print-section">
        <div className="print-section-title">Academic Qualifications</div>
        <div className="print-grid">
          {row("KCSE", r.kcse_year ? `${r.kcse_year} — Grade: ${r.kcse_grade}` : "")}
          {row("Certificate", r.cert_name ? `${r.cert_name} (${r.cert_year}) — ${r.cert_grade}` : "")}
          {row("Diploma", r.diploma_name ? `${r.diploma_name} (${r.diploma_year}) — ${r.diploma_grade}` : "")}
          {row("Higher Diploma", r.hdip_name ? `${r.hdip_name} (${r.hdip_year}) — ${r.hdip_grade}` : "")}
          {row("Degree", r.degree_name ? `${r.degree_name} (${r.degree_year}) — ${r.degree_grade}` : "")}
          {row("Masters", r.masters_name ? `${r.masters_name} (${r.masters_year}) — ${r.masters_grade}` : "")}
          {row("PhD", r.phd_name ? `${r.phd_name} (${r.phd_year}) — ${r.phd_grade}` : "")}
        </div>
      </div>

      <div className="print-section">
        <div className="print-section-title">Professional Development</div>
        <div className="print-grid">
          {row("Pedagogy", r.pedagogy_year ? `${r.pedagogy_year} — ${r.pedagogy_grade}` : "")}
          {row("ToT", r.tot_year ? `${r.tot_year} — ${r.tot_grade}` : "")}
          {row("Supervisory", r.superv_year ? `${r.superv_year} — ${r.superv_grade}` : "")}
          {row("Senior Management", r.senior_mgmt_year ? `${r.senior_mgmt_year} — ${r.senior_mgmt_grade}` : "")}
          {row("SLDP", r.sldp_year ? `${r.sldp_year} — ${r.sldp_grade}` : "")}
          {row("Retirement Course", r.retire_course_year ? `${r.retire_course_year} — ${r.retire_course_grade}` : "")}
          {(() => {
            try {
              const courses = JSON.parse(r.other_courses || "[]");
              return courses.map((c, i) => row(
                `Other Course ${i + 1}`,
                c.desc ? `${c.desc}${c.year ? ` (${c.year})` : ""}${c.grade ? ` — ${c.grade}` : ""}` : ""
              ));
            } catch { return null; }
          })()}
        </div>
      </div>

      {(r.tveta_reg_no || r.tveta_date || r.tveta_expiry) && (
        <div className="print-section">
          <div className="print-section-title">TVETA Registration</div>
          <div className="print-grid">
            {row("Registration No.", r.tveta_reg_no)}
            {row("Date Registered", r.tveta_date)}
            {row("Expiry Date", r.tveta_expiry)}
          </div>
        </div>
      )}

      <div className="print-footer">
        <span>National Youth Service Engineering Institute — Staff Data Platform</span>
        <span>Record ID: {r.id} | Submitted: {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("en-KE") : "—"}</span>
      </div>
    </div>
  );
}

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast-notification">
      <div className={type === 'success' ? 'toast-success' : 'toast-error'}>
        {type === 'success' ? <FaRegCheckCircle size={20} /> : <FaExclamationTriangle size={20} />}
        {message}
      </div>
    </div>
  );
}

// Custom Alert Modal Component
function CustomAlertModal({ isOpen, onClose, onConfirm, title, message, type = "warning" }) {
  if (!isOpen) return null;

  const icons = {
    warning: <FaExclamationTriangle size={48} style={{ color: C.warning }} />,
    success: <FaRegCheckCircle size={48} style={{ color: C.success }} />,
    error: <FaExclamationTriangle size={48} style={{ color: C.danger }} />,
    info: <FaInfoCircle size={48} style={{ color: C.info }} />
  };

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={e => e.stopPropagation()}>
        <div className="alert-modal-icon">{icons[type] || icons.warning}</div>
        <div className="alert-modal-title">{title}</div>
        <div className="alert-modal-message">{message}</div>
        <div className="alert-modal-buttons">
          <button className="alert-modal-btn alert-modal-btn-cancel" onClick={onClose}>Cancel</button>
          {onConfirm && <button className="alert-modal-btn alert-modal-btn-confirm" onClick={onConfirm}>Continue</button>}
        </div>
      </div>
    </div>
  );
}

function DataForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [successes, setSuccesses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = k => ({ value: form[k] || "", onChange: e => set(k, e.target.value) });
  const isPartTime = ["Part Time Lecturer", "Intern", "Teaching Practice"].includes(form.designation);

  const fieldMsg = (key) => {
    if (!errors[key] && !successes[key]) return null;
    const isError = !!errors[key];
    return (
      <span style={{ color: isError ? C.danger : C.success, fontSize: "0.72rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
        {isError ? <FaExclamationTriangle size={10} /> : <FaCheck size={10} />}
        {errors[key] || successes[key]}
      </span>
    );
  };

  const validate = () => {
    const e = {};

    // ── STEP 0: Personal Information ──────────────────────────────
    if (step === 0) {
      if (!form.fullName?.trim())
        e.fullName = "Required";

      if (!form.email?.trim())
        e.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Invalid email format";

      if (!form.gender)
        e.gender = "Required";

      if (!form.nationalId?.trim())
        e.nationalId = "Required";

      // DOB — all three parts required
      if (!form.dobDay || !form.dobMonth || !form.dobYear)
        e.dob = "Date of birth is required";
      else {
        // DOB cannot be in the future
        const dobMonth = MONTHS.indexOf(form.dobMonth);
        const dob = new Date(parseInt(form.dobYear), dobMonth, parseInt(form.dobDay));
        if (dob > new Date())
          e.dob = "Date of birth cannot be in the future";
      }

      // Disability must be selected
      if (!form.disability)
        e.disability = "Required — please select Yes or No";
      if (form.disability === "Yes" && !form.disabilityNature?.trim())
        e.disabilityNature = "Please describe the nature of disability";
    }

    // ── STEP 1: Employment ─────────────────────────────────────────
    if (step === 1) {
      if (!form.designation)
        e.designation = "Required";

      if (!form.department)
        e.department = "Required";

      // Personal Number — required and must be digits only
      if (["Full Time Lecturer", "Support Staff", "Intern"].includes(form.designation)) {
        if (!form.personalNumber?.trim())
          e.personalNumber = "Required";
        else if (!/^\d+$/.test(form.personalNumber.trim()))
          e.personalNumber = "Personal number must contain digits only — no letters, spaces or symbols";
      }

      // Job Group required for Full Time Lecturer and Support Staff
      if (["Full Time Lecturer", "Support Staff"].includes(form.designation)) {
        if (!form.jobGroup)
          e.jobGroup = "Required for this designation";
      }

      // Date of Appointment required
      if (!form.appointmentDay || !form.appointmentMonth || !form.appointmentYear) {
        e.appointment = "Date of appointment is required";
      } else {
        const apptMonth = MONTHS.indexOf(form.appointmentMonth);
        const apptDate = new Date(parseInt(form.appointmentYear), apptMonth, parseInt(form.appointmentDay));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // strip time for clean comparison
        if (apptDate > today)
          e.appointment = "Date of appointment cannot be in the future";
      }

      // Retirement / Expiry required for all
      if (!form.retirementDay || !form.retirementMonth || !form.retirementYear)
        e.retirement = "Retirement / contract expiry date is required";

      // Date logic — only check if both dates are fully entered
      if (
        form.appointmentDay && form.appointmentMonth && form.appointmentYear &&
        form.retirementDay && form.retirementMonth && form.retirementYear
      ) {
        const apptMonth = MONTHS.indexOf(form.appointmentMonth);
        const retMonth = MONTHS.indexOf(form.retirementMonth);
        const apptDate = new Date(parseInt(form.appointmentYear), apptMonth, parseInt(form.appointmentDay));
        const retDate = new Date(parseInt(form.retirementYear), retMonth, parseInt(form.retirementDay));

        if (retDate <= apptDate) {
          const label = ["Part Time Lecturer", "Intern", "Teaching Practice"].includes(form.designation)
            ? "Contract expiry"
            : "Date of retirement";
          e.retirement = `${label} must be after the date of appointment`;
        }
      }

      // Duties & Roles required
      if (!form.dutiesRoles?.trim())
        e.dutiesRoles = "Required — describe your duties and roles";

      // Responsibilities required
      if (!form.responsibilities?.trim())
        e.responsibilities = "Required — describe your responsibilities";
    }

    // ── STEP 2: Qualifications ─────────────────────────────────────
    if (step === 2) {
      // KCSE always required
      if (!form.kcseYear)
        e.kcseYear = "KCSE year is required";
      if (!form.kcseGrade?.trim())
        e.kcseGrade = "KCSE grade is required";

      // If any part of a qualification is entered, year and grade become required
      const qualChecks = [
        { name: "Certificate", nameKey: "certName", yearKey: "certYear", gradeKey: "certGrade" },
        { name: "Diploma", nameKey: "diplomaName", yearKey: "diplomaYear", gradeKey: "diplomaGrade" },
        { name: "Higher Diploma", nameKey: "hdipName", yearKey: "hdipYear", gradeKey: "hdipGrade" },
        { name: "Degree", nameKey: "degreeName", yearKey: "degreeYear", gradeKey: "degreeGrade" },
        { name: "Masters", nameKey: "mastersName", yearKey: "mastersYear", gradeKey: "mastersGrade" },
        { name: "PhD", nameKey: "phdName", yearKey: "phdYear", gradeKey: "phdGrade" },
      ];

      qualChecks.forEach(({ name, nameKey, yearKey, gradeKey }) => {
        const hasName = form[nameKey]?.trim();
        const hasYear = form[yearKey];
        const hasGrade = form[gradeKey]?.trim();
        // If any field is filled, all three become required
        if (hasName || hasYear || hasGrade) {
          if (!hasName) e[nameKey] = `${name} institution name is required`;
          if (!hasYear) e[yearKey] = `${name} year is required`;
          if (!hasGrade) e[gradeKey] = `${name} grade is required`;
        }
      });
    }

    // ── STEP 3: Professional Development ──────────────────────────
    if (step === 3) {
      // TVETA required for Full Time Lecturers
      if (form.designation === "Full Time Lecturer") {
        if (!form.tvetaRegNo?.trim())
          e.tvetaRegNo = "TVETA registration number is required for Full Time Lecturers";
        if (!form.tvetaDate)
          e.tvetaDate = "TVETA registration date is required";
        if (!form.tvetaExpiry)
          e.tvetaExpiry = "TVETA expiry date is required";
      }

      // If any prof dev course field is partially filled, require the rest
      const profDevChecks = [
        { name: "Pedagogy", yearKey: "pedagogyYear", gradeKey: "pedagogyGrade" },
        { name: "ToT", yearKey: "totYear", gradeKey: "totGrade" },
        { name: "Supervisory", yearKey: "supervYear", gradeKey: "supervGrade" },
        { name: "Senior Management", yearKey: "seniorMgmtYear", gradeKey: "seniorMgmtGrade" },
        { name: "SLDP", yearKey: "sldpYear", gradeKey: "sldpGrade" },
        { name: "Retirement Course", yearKey: "retireCourseYear", gradeKey: "retireCourseGrade" },
      ];

      profDevChecks.forEach(({ name, yearKey, gradeKey }) => {
        const hasYear = form[yearKey];
        const hasGrade = form[gradeKey]?.trim();
        if (hasYear && !hasGrade) e[gradeKey] = `${name} grade/score is required if year is entered`;
        if (hasGrade && !hasYear) e[yearKey] = `${name} year is required if grade is entered`;
      });

      // Other courses — if desc entered, year and grade required
      (form.otherCourses || []).forEach((course, index) => {
        if (course.desc?.trim() || course.year || course.grade) {
          //if (!course.desc?.trim()) e[`otherCourse_${index}_desc`] = `Course ${index + 1} name is required`;
          //if (!course.year) e[`otherCourse_${index}_year`] = `Course ${index + 1} year is required`;
          //if (!course.grade?.trim()) e[`otherCourse_${index}_grade`] = `Course ${index + 1} grade is required`;
          { fieldMsg(`otherCourse_${index}_desc`) }
          { fieldMsg(`otherCourse_${index}_year`) }
          { fieldMsg(`otherCourse_${index}_grade`) }
        }
      });
    }
    const s = {};

    // Step 0 successes
    if (step === 0) {
      if (form.fullName?.trim() && !e.fullName) s.fullName = "Looks good";
      if (form.email?.trim() && !e.email) s.email = "Looks good";
      if (form.nationalId?.trim() && !e.nationalId) s.nationalId = "Looks good";
      if (form.gender && !e.gender) s.gender = "Looks good";
      if (form.dobDay && form.dobMonth && form.dobYear && !e.dob) s.dob = "Looks good";
      if (form.disability && !e.disability) s.disability = "Looks good";
      if (form.disability === "Yes" && form.disabilityNature?.trim() && !e.disabilityNature) s.disabilityNature = "Looks good";
    }

    // Step 1 successes
    if (step === 1) {
      if (form.designation && !e.designation) s.designation = "Looks good";
      if (form.department && !e.department) s.department = "Looks good";
      if (form.personalNumber?.trim() && !e.personalNumber) s.personalNumber = "Looks good";
      if (form.jobGroup && !e.jobGroup) s.jobGroup = "Looks good";
      if (form.appointmentDay && form.appointmentMonth && form.appointmentYear && !e.appointment) s.appointment = "Looks good";
      if (form.retirementDay && form.retirementMonth && form.retirementYear && !e.retirement) s.retirement = "Looks good";
      if (form.dutiesRoles?.trim() && !e.dutiesRoles) s.dutiesRoles = "Looks good";
      if (form.responsibilities?.trim() && !e.responsibilities) s.responsibilities = "Looks good";
    }

    // Step 2 successes
    if (step === 2) {
      if (form.kcseYear && !e.kcseYear) s.kcseYear = "Looks good";
      if (form.kcseGrade && !e.kcseGrade) s.kcseGrade = "Looks good";
      ["cert", "diploma", "hdip", "degree", "masters", "phd"].forEach(prefix => {
        if (form[prefix + "Name"]?.trim() && !e[prefix + "Name"]) s[prefix + "Name"] = "Looks good";
        if (form[prefix + "Year"] && !e[prefix + "Year"]) s[prefix + "Year"] = "Looks good";
        if (form[prefix + "Grade"]?.trim() && !e[prefix + "Grade"]) s[prefix + "Grade"] = "Looks good";
      });
    }

    // Step 3 successes
    if (step === 3) {
      if (form.tvetaRegNo?.trim() && !e.tvetaRegNo) s.tvetaRegNo = "Looks good";
      if (form.tvetaDate && !e.tvetaDate) s.tvetaDate = "Looks good";
      if (form.tvetaExpiry && !e.tvetaExpiry) s.tvetaExpiry = "Looks good";
    }

    setSuccesses(s);

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 4)); };
  const back = () => setStep(s => Math.max(s - 1, 0));

  const checkExistingAndSubmit = async () => {
    setSubmitting(true);

    const { data: existing, error } = await supabase
      .from("staff_submissions")
      .select("national_id, submitted_count")
      .eq("national_id", form.nationalId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record found

    if (existing && !error) {
      setPendingSubmission(existing);
      setShowConfirmModal(true);
      setSubmitting(false);
      return;
    }

    await performSubmit();
  };

  const performSubmit = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);

    const dbRecord = {
      full_name: form.fullName,
      email: form.email,
      gender: form.gender,
      national_id: form.nationalId,
      dob_day: form.dobDay,
      dob_month: form.dobMonth,
      dob_year: form.dobYear,
      job_group: form.jobGroup,
      disability: form.disability,
      disability_nature: form.disabilityNature,
      appointment_day: form.appointmentDay,
      appointment_month: form.appointmentMonth,
      appointment_year: form.appointmentYear,
      retirement_day: form.retirementDay,
      retirement_month: form.retirementMonth,
      retirement_year: form.retirementYear,
      designation: form.designation,
      department: form.department,
      personal_number: ["Full Time Lecturer", "Support Staff", "Intern"].includes(form.designation) ? form.personalNumber : null,
      duties_roles: form.dutiesRoles,
      responsibilities: form.responsibilities,
      kcse_year: form.kcseYear,
      kcse_grade: form.kcseGrade,
      cert_name: form.certName,
      cert_year: form.certYear,
      cert_grade: form.certGrade,
      diploma_name: form.diplomaName,
      diploma_year: form.diplomaYear,
      diploma_grade: form.diplomaGrade,
      hdip_name: form.hdipName,
      hdip_year: form.hdipYear,
      hdip_grade: form.hdipGrade,
      degree_name: form.degreeName,
      degree_year: form.degreeYear,
      degree_grade: form.degreeGrade,
      masters_name: form.mastersName,
      masters_year: form.mastersYear,
      masters_grade: form.mastersGrade,
      phd_name: form.phdName,
      phd_year: form.phdYear,
      phd_grade: form.phdGrade,
      pedagogy_year: form.pedagogyYear,
      pedagogy_grade: form.pedagogyGrade,
      tot_year: form.totYear,
      tot_grade: form.totGrade,
      superv_year: form.supervYear,
      superv_grade: form.supervGrade,
      senior_mgmt_year: form.seniorMgmtYear,
      senior_mgmt_grade: form.seniorMgmtGrade,
      sldp_year: form.sldpYear,
      sldp_grade: form.sldpGrade,
      retire_course_year: form.retireCourseYear,
      retire_course_grade: form.retireCourseGrade,
      other_courses: form.otherCourses?.length ? JSON.stringify(form.otherCourses) : null,
      tveta_date: form.tvetaDate,
      tveta_expiry: form.tvetaExpiry,
      tveta_reg_no: form.tvetaRegNo,
      personal_number: ["Full Time Lecturer", "Support Staff", "Intern"].includes(form.designation) ? form.personalNumber : null,
      submitted_at: new Date().toISOString(),
      submitted_count: pendingSubmission ? (pendingSubmission.submitted_count || 0) + 1 : 1
    };

    let error;
    if (pendingSubmission) {
      const { error: updateError } = await supabase
        .from("staff_submissions")
        .update(dbRecord)
        .eq("national_id", form.nationalId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("staff_submissions")
        .insert([dbRecord]);
      error = insertError;
    }

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert("Error saving data: " + error.message);
      return;
    }

    setSubmitted(true);
    setPendingSubmission(null);
  };

  if (submitted) return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <div style={{ marginBottom: "1rem", color: C.success }}>
          <FaRegCheckCircle size={52} />
        </div>
        <h2 style={{ fontFamily: "sans-serif", color: C.success, marginBottom: 6 }}>Submission Received</h2>
        <p style={{ fontFamily: "sans-serif", color: C.muted, marginBottom: "1.5rem" }}>
          Thank you, <strong>{form.fullName}</strong>. Your data has been recorded successfully.
        </p>
        <button className="btn" onClick={() => { setForm(emptyForm()); setStep(0); setSubmitted(false); }}>
          Submit Another Response
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      <CustomAlertModal
        isOpen={showConfirmModal}
        onClose={() => { setShowConfirmModal(false); setPendingSubmission(null); }}
        onConfirm={performSubmit}
        title="⚠️ Existing Record Found"
        message={`A submission with National ID "${form.nationalId}" already exists. This will UPDATE your previous submission. Do you want to continue?`}
        type="warning"
      />

      <div className="card">
        <div style={{ marginBottom: "1.25rem" }}>
          <h1 style={{ fontFamily: "sans-serif", fontSize: "1.25rem", color: C.primary, marginBottom: 4 }}>
            Staff Data Collection Form
          </h1>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.8rem", color: C.muted }}>
            National Youth Service Engineering Institute — Please complete all applicable fields accurately.
          </p>
        </div>

        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={i} className={"step-item " + (i === step ? "step-active" : i < step ? "step-done" : "step-idle")}>
              {i < step ? <FaCheck size={10} /> : ""}{s}
            </div>
          ))}
        </div>

        {step === 0 && <>
          <div className="sec-title"><FaUser size={12} /> Personal Information</div>
          <div className="grid-2">
            <div className="field">
              <label className="label"><FaUser size={12} /> Full Name *</label>
              <input {...inp("fullName")} style={{ borderColor: errors.fullName ? C.danger : successes.fullName ? C.success : C.border }} />
              {fieldMsg("fullName")}
            </div>
            <div className="field">
              <label className="label"><FaEnvelope size={12} /> Email Address *</label>
              <input type="email" {...inp("email")} style={{ borderColor: errors.email ? C.danger : successes.email ? C.success : C.border }} />
              {fieldMsg("email")}
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="label"><FaIdCard size={12} /> National ID No. *</label>
              <input {...inp("nationalId")} style={{ borderColor: errors.nationalId ? C.danger : successes.nationalId ? C.success : C.border }} />
              {fieldMsg("nationalId")}
            </div>
            <div className="field">
              <label className="label">Gender *</label>
              <select {...inp("gender")} style={{ borderColor: errors.gender ? C.danger : successes.gender ? C.success : C.border }}>
                <option value="">Select…</option><option>Male</option><option>Female</option>
              </select>
              {fieldMsg("gender")}
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <DateFields prefix="dob" label="Date of Birth *" form={form} onChange={set} />
              {fieldMsg("dob")}
            </div>
            <div className="field">
              <label className="label">Disability *</label>
              <select {...inp("disability")} style={{ borderColor: errors.disability ? C.danger : successes.disability ? C.success : C.border }}>
                <option value="">Select…</option><option>No</option><option>Yes</option>
              </select>
              {fieldMsg("disability")}
            </div>
          </div>
          {form.disability === "Yes" && (
            <div className="field" style={{ marginBottom: "0.75rem" }}>
              <label className="label">Nature of Disability *</label>
              <input {...inp("disabilityNature")} placeholder="Describe…" style={{ borderColor: errors.disabilityNature ? C.danger : successes.disabilityNature ? C.success : C.border }} />
              {fieldMsg("disabilityNature")}
            </div>
          )}
        </>}

        {/* Employment Details Section */}
        {step === 1 && <>
          <div className="sec-title"><FaBriefcase size={12} /> Employment Details</div>

          <div className="grid-2">
            <div className="field">
              <label className="label">Designation *</label>
              <select {...inp("designation")} style={{ borderColor: errors.designation ? C.danger : successes.designation ? C.success : C.border }}>
                <option value="">Select…</option>
                {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
              {fieldMsg("designation")}
            </div>
            <div className="field">
              <label className="label">Department *</label>
              <select {...inp("department")} style={{ borderColor: errors.department ? C.danger : successes.department ? C.success : C.border }}>
                <option value="">Select…</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
              {fieldMsg("department")}
            </div>
          </div>

          {["Full Time Lecturer", "Support Staff", "Intern"].includes(form.designation) && (
            <div className="field" style={{ marginBottom: "1rem" }}>
              <label className="label">Personal Number *</label>
              <input
                {...inp("personalNumber")}
                placeholder="Digits only e.g. 12345"
                style={{ borderColor: errors.personalNumber ? C.danger : successes.personalNumber ? C.success : C.border }}
              />
              {fieldMsg("personalNumber")}
            </div>
          )}

          <div className="grid-2">
            {!isPartTime && (
              <div className="field">
                <label className="label">Job Group {["Full Time Lecturer", "Support Staff"].includes(form.designation) ? "*" : ""}</label>
                <select {...inp("jobGroup")} style={{ borderColor: errors.jobGroup ? C.danger : successes.jobGroup ? C.success : C.border }}>
                  <option value="">Select…</option>
                  {JOB_GROUPS.map(g => <option key={g}>Group {g}</option>)}
                </select>
                {fieldMsg("jobGroup")}
              </div>
            )}
            <div className="field">
              <DateFields prefix="appointment" label="Date of Appointment *" form={form} onChange={set} />
              {fieldMsg("appointment")}
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <DateFields prefix="retirement" label={isPartTime ? "Contract Expiry *" : "Date of Retirement *"} form={form} onChange={set} />
              {fieldMsg("retirement")}
            </div>
          </div>

          <div className="field" style={{ marginBottom: "1rem" }}>
            <label className="label">Duties & Roles * (e.g. HOD, Deputy HOD, Internal Verifier)</label>
            <input
              {...inp("dutiesRoles")}
              placeholder="e.g. HOD, Deputy HOD, Internal Verifier"
              style={{ borderColor: errors.dutiesRoles ? C.danger : successes.dutiesRoles ? C.success : C.border }}
            />
            {fieldMsg("dutiesRoles")}
          </div>

          <div className="field">
            <label className="label">Responsibilities *</label>
            <textarea
              {...inp("responsibilities")}
              placeholder="Describe your key responsibilities…"
              style={{ borderColor: errors.responsibilities ? C.danger : successes.responsibilities ? C.success : C.border }}
            />
            {fieldMsg("responsibilities")}
          </div>
        </>}

        {/* New Academic Qualifications Section */}
        {step === 2 && <>
          <div className="sec-title"><FaBook size={12} /> Academic Qualifications</div>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.78rem", color: C.muted, marginBottom: "1rem" }}>
            Fill only qualifications you hold. KCSE is required. For others, if you enter any field you must complete all three.
          </p>
          {[
            { label: "KCSE", prefix: "kcse", noName: true, required: true },
            { label: "Certificate", prefix: "cert" },
            { label: "Diploma", prefix: "diploma" },
            { label: "Higher Diploma", prefix: "hdip" },
            { label: "Degree", prefix: "degree" },
            { label: "Masters", prefix: "masters" },
            { label: "PhD", prefix: "phd" },
          ].map(({ label, prefix, noName, required }) => (
            <div key={prefix} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
              <div className="qual-label">
                <FaGraduationCap size={10} /> {label}{required && " *"}
              </div>
              <div className="qual-row">
                {!noName && (
                  <div className="field qual-name">
                    <label className="label">Name / Institution</label>
                    <input
                      value={form[prefix + "Name"] || ""}
                      onChange={e => set(prefix + "Name", e.target.value)}
                      style={{ borderColor: errors[prefix + "Name"] ? C.danger : successes[prefix + "Name"] ? C.success : C.border }}
                    />
                    {errors[prefix + "Name"] && (
                      <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                        <FaExclamationTriangle size={10} />{errors[prefix + "Name"]}
                      </span>
                    )}
                  </div>
                )}
                <div className="field">
                  <label className="label">Year{required && " *"}</label>
                  <input
                    type="number"
                    placeholder="YYYY"
                    value={form[prefix + "Year"] || ""}
                    onChange={e => set(prefix + "Year", e.target.value)}
                    style={{ borderColor: errors[prefix + "Year"] ? C.danger : successes[prefix + "Year"] ? C.success : C.border }}
                  />
                  {errors[prefix + "Year"] && (
                    <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaExclamationTriangle size={10} />{errors[prefix + "Year"]}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label className="label">Grade / Score{required && " *"}</label>
                  <input
                    value={form[prefix + "Grade"] || ""}
                    onChange={e => set(prefix + "Grade", e.target.value)}
                    style={{ borderColor: errors[prefix + "Grade"] ? C.danger : successes[prefix + "Grade"] ? C.success : C.border }}
                  />
                  {errors[prefix + "Grade"] && (
                    <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaExclamationTriangle size={10} />{errors[prefix + "Grade"]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>}

        {step === 3 && <>
          <div className="sec-title"><FaChalkboardTeacher size={12} /> Professional Development</div>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.78rem", color: C.muted, marginBottom: "1rem" }}>
            Complete only trainings/courses you have undertaken. If you enter a year you must also enter a grade, and vice versa.
          </p>

          {[
            { label: "Pedagogy", yk: "pedagogyYear", gk: "pedagogyGrade" },
            { label: "Training of Trainers (ToT)", yk: "totYear", gk: "totGrade" },
            { label: "Supervisory Course", yk: "supervYear", gk: "supervGrade" },
            { label: "Senior Management", yk: "seniorMgmtYear", gk: "seniorMgmtGrade" },
            { label: "SLDP", yk: "sldpYear", gk: "sldpGrade" },
            { label: "Retirement Course", yk: "retireCourseYear", gk: "retireCourseGrade" },
          ].map(({ label, yk, gk }) => (
            <div key={yk} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
              <div className="qual-label"><FaCertificate size={10} /> {label}</div>
              <div className="grid-2" style={{ marginBottom: 0 }}>
                <div className="field">
                  <label className="label">Year</label>
                  <input
                    type="number"
                    placeholder="YYYY"
                    value={form[yk] || ""}
                    onChange={e => set(yk, e.target.value)}
                    style={{ borderColor: errors[yk] ? C.danger : successes[yk] ? C.success : C.border }}
                  />
                  {errors[yk] && (
                    <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaExclamationTriangle size={10} />{errors[yk]}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label className="label">Grade / Score</label>
                  <input
                    value={form[gk] || ""}
                    onChange={e => set(gk, e.target.value)}
                    style={{ borderColor: errors[gk] ? C.danger : successes[gk] ? C.success : C.border }}
                  />
                  {errors[gk] && (
                    <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaExclamationTriangle size={10} />{errors[gk]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Any Other Courses — dynamic list */}
          <div style={{ marginBottom: "0.75rem" }}>
            <div className="qual-label"><FaCertificate size={10} /> Any Other Course(s)</div>

            {(form.otherCourses || []).map((course, index) => (
              <div key={index} style={{ background: C.light, borderRadius: 8, padding: "0.75rem", marginBottom: "0.6rem", border: `1px solid ${errors[`otherCourse_${index}_desc`] || errors[`otherCourse_${index}_year`] || errors[`otherCourse_${index}_grade`] ? C.danger : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.75rem", fontWeight: 700, color: C.primary }}>
                    Course {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => set("otherCourses", form.otherCourses.filter((_, i) => i !== index))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, display: "flex", alignItems: "center", gap: 4, fontFamily: "sans-serif", fontSize: "0.75rem" }}
                  >
                    <FaTrash size={10} /> Remove
                  </button>
                </div>
                <div className="field" style={{ marginBottom: "0.5rem" }}>
                  <label className="label">Course Name / Description</label>
                  <input
                    value={course.desc || ""}
                    onChange={e => {
                      const updated = [...form.otherCourses];
                      updated[index] = { ...updated[index], desc: e.target.value };
                      set("otherCourses", updated);
                    }}
                    placeholder="e.g. Project Management, Leadership Training…"
                    style={{ borderColor: errors[`otherCourse_${index}_desc`] ? C.danger : successes[`otherCourse_${index}_desc`] ? C.success : C.border }}
                  />
                  {errors[`otherCourse_${index}_desc`] && (
                    <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                      <FaExclamationTriangle size={10} />{errors[`otherCourse_${index}_desc`]}
                    </span>
                  )}
                </div>
                <div className="grid-2" style={{ marginBottom: 0 }}>
                  <div className="field">
                    <label className="label">Year</label>
                    <input
                      type="number"
                      placeholder="YYYY"
                      value={course.year || ""}
                      onChange={e => {
                        const updated = [...form.otherCourses];
                        updated[index] = { ...updated[index], year: e.target.value };
                        set("otherCourses", updated);
                      }}
                      style={{ borderColor: errors[`otherCourse_${index}_year`] ? C.danger : successes[`otherCourse_${index}_year`] ? C.success : C.border }}
                    />
                    {errors[`otherCourse_${index}_year`] && (
                      <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                        <FaExclamationTriangle size={10} />{errors[`otherCourse_${index}_year`]}
                      </span>
                    )}
                  </div>
                  <div className="field">
                    <label className="label">Grade / Score</label>
                    <input
                      value={course.grade || ""}
                      onChange={e => {
                        const updated = [...form.otherCourses];
                        updated[index] = { ...updated[index], grade: e.target.value };
                        set("otherCourses", updated);
                      }}
                      placeholder="e.g. Pass / 78%"
                      style={{ borderColor: errors[`otherCourse_${index}_grade`] ? C.danger : successes[`otherCourse_${index}_grade`] ? C.success : C.border }}
                    />
                    {errors[`otherCourse_${index}_grade`] && (
                      <span style={{ color: C.danger, fontSize: "0.7rem", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
                        <FaExclamationTriangle size={10} />{errors[`otherCourse_${index}_grade`]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: "0.78rem", padding: "6px 14px" }}
              onClick={() => set("otherCourses", [...(form.otherCourses || []), { desc: "", year: "", grade: "" }])}
            >
              <FaPlus size={10} /> Add Course
            </button>
          </div>

          {/* TVETA Registration */}
          <div className="sec-title" style={{ marginTop: "1.5rem" }}>
            <FaCertificate size={12} /> TVETA Registration
            {form.designation === "Full Time Lecturer" && (
              <span style={{ fontFamily: "sans-serif", fontSize: "0.65rem", color: C.danger, marginLeft: 6, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                * Required for Full Time Lecturers
              </span>
            )}
          </div>
          <div className="grid-3">
            <div className="field">
              <label className="label">
                Date of Registration{form.designation === "Full Time Lecturer" && " *"}
              </label>
              <input
                type="date"
                {...inp("tvetaDate")}
                style={{ borderColor: errors.tvetaDate ? C.danger : successes.tvetaDate ? C.success : C.border }}
              />
              {fieldMsg("tvetaDate")}
            </div>
            <div className="field">
              <label className="label">
                Expiry Date{form.designation === "Full Time Lecturer" && " *"}
              </label>
              <input
                type="date"
                {...inp("tvetaExpiry")}
                style={{ borderColor: errors.tvetaExpiry ? C.danger : successes.tvetaExpiry ? C.success : C.border }}
              />
              {fieldMsg("tvetaExpiry")}
            </div>
            <div className="field">
              <label className="label">
                Registration Number{form.designation === "Full Time Lecturer" && " *"}
              </label>
              <input
                {...inp("tvetaRegNo")}
                placeholder="e.g. TVETA/2023/…"
                style={{ borderColor: errors.tvetaRegNo ? C.danger : successes.tvetaRegNo ? C.success : C.border }}
              />
              {fieldMsg("tvetaRegNo")}
            </div>
          </div>
        </>}

        {/* Review Step */}
        {step === 4 && <>
          <div className="sec-title"><FaClipboardList size={12} /> Review Your Submission</div>
          <div className="alert-success"><FaCheck size={14} /> Please confirm your details below before submitting.</div>
          {[
            ["Full Name", form.fullName],
            ["Email", form.email],
            ["Gender", form.gender],
            ["National ID", form.nationalId],
            ["Date of Birth", [form.dobDay, form.dobMonth, form.dobYear].filter(Boolean).join(" ")],
            ["Designation", form.designation],
            ["Department", form.department],
            ["Personal Number", ["Full Time Lecturer", "Support Staff", "Intern"].includes(form.designation) ? form.personalNumber : null],
            ["Job Group", form.jobGroup || "N/A"],
            ["Disability", form.disability || "Not stated"],
            ["Appointment", [form.appointmentDay, form.appointmentMonth, form.appointmentYear].filter(Boolean).join(" ")],
            ["Retirement/Expiry", [form.retirementDay, form.retirementMonth, form.retirementYear].filter(Boolean).join(" ")],
            ["Duties/Roles", form.dutiesRoles || "—"],
            ["KCSE", form.kcseYear ? `${form.kcseYear} — ${form.kcseGrade}` : null],
            ["Certificate", form.certName ? `${form.certName} (${form.certYear}) — ${form.certGrade}` : null],
            ["Diploma", form.diplomaName ? `${form.diplomaName} (${form.diplomaYear}) — ${form.diplomaGrade}` : null],
            ["Higher Diploma", form.hdipName ? `${form.hdipName} (${form.hdipYear}) — ${form.hdipGrade}` : null],
            ["Degree", form.degreeName ? `${form.degreeName} (${form.degreeYear}) — ${form.degreeGrade}` : null],
            ["Masters", form.mastersName ? `${form.mastersName} (${form.mastersYear}) — ${form.mastersGrade}` : null],
            ["PhD", form.phdName ? `${form.phdName} (${form.phdYear}) — ${form.phdGrade}` : null],
            ["Pedagogy", form.pedagogyYear ? `${form.pedagogyYear} — ${form.pedagogyGrade}` : null],
            ["ToT", form.totYear ? `${form.totYear} — ${form.totGrade}` : null],
            ["Supervisory", form.supervYear ? `${form.supervYear} — ${form.supervGrade}` : null],
            ["Senior Management", form.seniorMgmtYear ? `${form.seniorMgmtYear} — ${form.seniorMgmtGrade}` : null],
            ["SLDP", form.sldpYear ? `${form.sldpYear} — ${form.sldpGrade}` : null],
            ["Retirement Course", form.retireCourseYear ? `${form.retireCourseYear} — ${form.retireCourseGrade}` : null],
            ...(form.otherCourses || []).map((c, i) => [
              `Other Course ${i + 1}`,
              c.desc ? `${c.desc}${c.year ? ` (${c.year})` : ""}${c.grade ? ` — ${c.grade}` : ""}` : null
            ]),
            ["TVETA Reg No.", form.tvetaRegNo || null],
            ["TVETA Registered", form.tvetaDate || null],
            ["TVETA Expiry", form.tvetaExpiry || null],
          ].filter(([_, v]) => v !== null).map(([k, v]) => (
            <div className="rev-row" key={k}>
              <span className="rev-key">{k}</span>
              <span className="rev-val">{v || "—"}</span>
            </div>
          ))}
        </>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.75rem", gap: 8 }}>
          {step > 0 ? <button className="btn-outline" onClick={back} disabled={submitting}><FaArrowLeft size={12} /> Back</button> : <span />}
          {step < 4
            ? <button className="btn" onClick={next}>Continue <FaArrowRight size={12} /></button>
            : <button className="btn-accent" onClick={checkExistingAndSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : <><FaCheck size={12} /> Submit Form</>}
            </button>
          }
        </div>
      </div>
    </div>
  );
}

// UPDATED Login component with generic placeholder
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase
        .from("admin_users")
        .select("username, role, name, password_hash")
        .eq("username", username.toLowerCase().trim())
        .single();

      if (queryError || !data) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash);

      if (isValidPassword) {
        onLogin({
          username: data.username,
          role: data.role,
          name: data.name,
        });
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem 1rem", background: C.bg }}>
      <div className="card" style={{ maxWidth: 380, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <img src={LOGO} alt="NYS Logo" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 12 }} />
          <h2 style={{ fontFamily: "sans-serif", color: C.primary, marginBottom: 4 }}>Admin Login</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: "0.78rem", color: C.muted }}>NYSEI Staff Data Platform</p>
        </div>
        {error && <div className="alert-danger"><FaExclamationTriangle size={14} /> {error}</div>}
        <div className="field" style={{ marginBottom: "1rem" }}>
          <label className="label"><FaUser size={12} /> Username</label>
          <input
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
            placeholder="Enter username"
            disabled={loading}
          />
        </div>
        <div className="field" style={{ marginBottom: "1.5rem" }}>
          <label className="label"><FaLock size={12} /> Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && submit()}
              disabled={loading}
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
        </div>
        <button className="btn" style={{ width: "100%" }} onClick={submit} disabled={loading}>
          {loading ? <FaSpinner className="spin" size={14} /> : <FaLock size={12} />}
          {loading ? " Signing in..." : " Sign In"}
        </button>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.7rem", color: C.muted, textAlign: "center", marginTop: "1rem" }}>
          Secure Admin Access Only
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: IconComponent, color, trend, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon" style={{ color: color || C.primary }}>
        {IconComponent && <IconComponent size={32} />}
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-val">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {trend && <div style={{ fontSize: "0.7rem", color: trend > 0 ? C.success : C.danger, marginTop: 4 }}>
          <FaArrowUp size={10} /> {Math.abs(trend)}%
        </div>}
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400, textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: 48, color: C.warning, marginBottom: "0.5rem" }}>
            <FaQuestionCircle size={48} />
          </div>
          <h3 style={{ fontFamily: "sans-serif", color: C.danger, marginBottom: "0.5rem" }}>{title}</h3>
          <p style={{ fontFamily: "sans-serif", color: C.text, marginBottom: "0.5rem" }}>{message}</p>
          {itemName && (
            <p style={{ fontFamily: "sans-serif", fontWeight: "bold", color: C.primary, marginTop: "0.5rem" }}>
              "{itemName}"
            </p>
          )}
          <p style={{ fontFamily: "sans-serif", fontSize: "0.8rem", color: C.danger, marginTop: "1rem" }}>
            ⚠️ This action cannot be undone!
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
          <button className="btn-outline" onClick={onClose}>
            <FaBan size={12} /> Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            <FaTrash size={12} /> Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ admin, onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("analytics");
  const [filterDept, setFilterDept] = useState("");
  const [filterDesig, setFilterDesig] = useState("");
  const [sortField, setSortField] = useState("submitted_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [deleting, setDeleting] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: "" });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("staff_submissions").select("*");

      if (dateRange.start) query = query.gte("submitted_at", dateRange.start);
      if (dateRange.end) query = query.lte("submitted_at", dateRange.end);

      const { data, error } = await query.order(sortField, { ascending: sortDirection === "asc" });

      if (!error) {
        setData(data || []);
      } else {
        console.error("Error loading data:", error);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection, dateRange]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteRecord = async (id, fullName) => {
    if (!id) {
      showToast("Invalid record ID", "error");
      return;
    }

    setDeleting(id);

    try {
      const { error } = await supabase
        .from("staff_submissions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        showToast("Error deleting record: " + error.message, "error");
        setDeleting(null);
        return;
      }

      // IMMEDIATELY update local state - remove the deleted record
      setData(prevData => prevData.filter(record => record.id !== id));

      // Close modal if the deleted record was open
      if (selected?.id === id) {
        setSelected(null);
      }

      // Show toast notification instead of alert
      showToast(`✓ Record for "${fullName}" has been deleted successfully.`, "success");

    } catch (err) {
      console.error("Delete error:", err);
      showToast("An error occurred while deleting the record.", "error");
    } finally {
      setDeleting(null);
      setConfirmModal({ isOpen: false, id: null, name: "" });
    }
  };

  const openConfirmModal = (id, name) => {
    if (!id) return;
    setConfirmModal({ isOpen: true, id, name });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, id: null, name: "" });
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Full CSV export with every field
  const exportCSV = () => {
    if (!data.length) {
      showToast("No data to export", "error");
      return;
    }
    const header = EXPORT_COLUMNS.map(([lbl]) => `"${lbl}"`).join(",");
    const rows = data.map(d =>
      EXPORT_COLUMNS.map(([, key]) => `"${(d[key] || "").toString().replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob(["\uFEFF" + header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `NYSEI_Staff_Data_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(a.href);
    showToast(`✓ Exported ${data.length} records successfully!`, "success");
  };

  const filtered = data
    .filter(d => (!filterDept || d.department === filterDept) && (!filterDesig || d.designation === filterDesig))
    .filter(d => !searchTerm ||
      d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.national_id?.includes(searchTerm) ||
      d.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.designation?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (sortField === "submitted_at") {
        aVal = new Date(aVal); bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const byDept = DEPARTMENTS.reduce((a, d) => { a[d] = data.filter(x => x.department === d).length; return a; }, {});
  const byDesig = DESIGNATIONS.reduce((a, d) => { a[d] = data.filter(x => x.designation === d).length; return a; }, {});
  const byGender = { Male: data.filter(x => x.gender === "Male").length, Female: data.filter(x => x.gender === "Female").length };

  // Age distribution
  const currentYear = new Date().getFullYear();
  const ageBands = {
    "Under 30": 0,
    "30 – 39": 0,
    "40 – 49": 0,
    "50 – 59": 0,
    "60 & Above": 0,
  };
  data.forEach(x => {
    if (!x.dob_year) return;
    const age = currentYear - parseInt(x.dob_year);
    if (age < 30) ageBands["Under 30"]++;
    else if (age < 40) ageBands["30 – 39"]++;
    else if (age < 50) ageBands["40 – 49"]++;
    else if (age < 60) ageBands["50 – 59"]++;
    else ageBands["60 & Above"]++;
  });
  const ageChartData = Object.entries(ageBands).map(([band, count]) => ({ band, count }));
  const avgAge = data.filter(x => x.dob_year).length > 0
    ? Math.round(data.filter(x => x.dob_year).reduce((sum, x) => sum + (currentYear - parseInt(x.dob_year)), 0) / data.filter(x => x.dob_year).length)
    : 0;

  const submissionsByMonth = data.reduce((acc, item) => {
    if (item.submitted_at) {
      const month = new Date(item.submitted_at).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  const timeSeriesData = Object.entries(submissionsByMonth).map(([month, count]) => ({ month, count }));

  const qualificationLevels = {
    "Certificate": data.filter(x => x.cert_name).length,
    "Diploma": data.filter(x => x.diploma_name).length,
    "Degree": data.filter(x => x.degree_name).length,
    "Masters": data.filter(x => x.masters_name).length,
    "PhD": data.filter(x => x.phd_name).length
  };

  const pieData = Object.entries(qualificationLevels).map(([name, value]) => ({ name, value }));

  const disabilityData = [
    { name: "With Disability", value: data.filter(x => x.disability === "Yes").length },
    { name: "No Disability", value: data.filter(x => x.disability !== "Yes").length }
  ];

  const jobGroupData = data.reduce((acc, item) => {
    if (item.job_group) {
      acc[item.job_group] = (acc[item.job_group] || 0) + 1;
    }
    return acc;
  }, {});

  const jobGroupChartData = Object.entries(jobGroupData).map(([group, count]) => ({ group, count }));

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FaSort size={10} style={{ marginLeft: 4 }} />;
    return sortDirection === "asc" ? <FaSortUp size={10} style={{ marginLeft: 4 }} /> : <FaSortDown size={10} style={{ marginLeft: 4 }} />;
  };

  const fmtDate = (d, m, y) => [d, m, y].filter(Boolean).join(" ");

  const navBtn = (id, lbl, icon) => (
    <button key={id} className={view === id ? "btn" : "btn-outline"} onClick={() => setView(id)}>
      {icon} {lbl}
    </button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Print area — hidden on screen, shown when printing */}
      {selected && <PrintRecord r={selected} />}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={() => deleteRecord(confirmModal.id, confirmModal.name)}
        title="Confirm Deletion"
        message="Are you sure you want to delete this staff record?"
        itemName={confirmModal.name}
      />

      <div className="nav-bar no-print">
        <div className="nav-tabs">
          {navBtn("analytics", "Analytics", <FaChartBar size={14} />)}
          {navBtn("records", "Records", <FaTable size={14} />)}
          {navBtn("insights", "Insights", <MdTimeline size={14} />)}
        </div>
        <div className="nav-user">
          <button className="btn-outline" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={load}>
            <FaDatabase /><span className="hide-sm"> Refresh</span>
          </button>
          <button className="btn-outline" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={exportCSV} disabled={!data.length}>
            <FaFileExport /><span className="hide-sm"> Export CSV</span>
          </button>
          <FaUserShield size={14} style={{ color: C.muted }} />
          <span style={{ color: C.muted }}>{admin.name}</span>
          <button className="btn-outline" style={{ padding: "5px 12px" }} onClick={onLogout}>
            <FaSignOutAlt size={12} /> Sign Out
          </button>
        </div>
      </div>

      <div className="container-wide no-print">
        <div className="filter-bar">
          <div className="search-wrap">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search name, email, ID, department..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <div className="filter-group">
            <label className="label"><FaFilter size={10} /> Department</label>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="label"><FaUserTie size={10} /> Designation</label>
            <select value={filterDesig} onChange={e => setFilterDesig(e.target.value)}>
              <option value="">All Designations</option>
              {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          {(searchTerm || filterDept || filterDesig) &&
            <button className="btn-outline" style={{ color: C.danger, borderColor: C.danger, padding: "8px 10px" }}
              onClick={() => { setSearchTerm(""); setFilterDept(""); setFilterDesig(""); }}>
              <FaTimes /> Clear
            </button>
          }
        </div>

        {view === "analytics" && (
          <>
            <div className="grid-stat">
              <StatCard label="Total Staff" value={data.length} icon={FaUsers} color={C.primary} />
              <StatCard label="Male" value={byGender.Male} icon={FaMale} color="#4A90E2" />
              <StatCard label="Female" value={byGender.Female} icon={FaFemale} color="#E25A6E" />
              <StatCard label="Average Age" value={avgAge ? `${avgAge} yrs` : "—"} icon={FaRegCalendarAlt} color={C.info} />
              <StatCard label="With Disability" value={data.filter(x => x.disability === "Yes").length} icon={FaWheelchair} color={C.warning} />
              <StatCard label="Degree Holders" value={data.filter(x => x.degree_name).length} icon={FaGraduationCap} color={C.success} />
              <StatCard label="TVETA Registered" value={data.filter(x => x.tveta_reg_no?.trim()).length} icon={FaCertificate} color={C.accent} />
            </div>

            <div className="grid-2">
              <div className="chart-container">
                <div className="sec-title"><FaBuilding size={12} /> Staff by Department</div>
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={Object.entries(byDept).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={C.primary} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <div className="sec-title"><FaUserTie size={12} /> Staff by Designation</div>
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={Object.entries(byDesig).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={C.accent} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <div className="sec-title"><FaChartPie size={12} /> Qualification Levels</div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <div className="sec-title"><FaWheelchair size={12} /> Disability Status</div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={disabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      <Cell fill={C.warning} />
                      <Cell fill={C.success} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Age Distribution — full width */}
              <div className="chart-container" style={{ gridColumn: "1 / -1" }}>
                <div className="sec-title"><FaRegCalendarAlt size={12} /> Staff Age Distribution</div>

                {/* Age band summary cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
                  {ageChartData.map(({ band, count }) => (
                    <div key={band} style={{ background: C.light, borderRadius: 8, padding: "0.75rem", textAlign: "center", border: `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: "sans-serif", fontSize: "0.62rem", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                        {band}
                      </div>
                      <div style={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: 700, color: C.primary }}>
                        {count}
                      </div>
                      <div style={{ fontFamily: "sans-serif", fontSize: "0.68rem", color: C.muted, marginTop: 2 }}>
                        {data.filter(x => x.dob_year).length > 0
                          ? `${Math.round((count / data.filter(x => x.dob_year).length) * 100)}%`
                          : "0%"
                        }
                      </div>
                    </div>
                  ))}
                  <div style={{ background: C.primary, borderRadius: 8, padding: "0.75rem", textAlign: "center", border: `1px solid ${C.primary}` }}>
                    <div style={{ fontFamily: "sans-serif", fontSize: "0.62rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      Average Age
                    </div>
                    <div style={{ fontFamily: "sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>
                      {avgAge || "—"}
                    </div>
                    <div style={{ fontFamily: "sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                      years
                    </div>
                  </div>
                </div>

                {/* Age bar chart */}
                <ResponsiveContainer width="100%" height={250}>
                  <ReBarChart data={ageChartData} barSize={48}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="band" fontFamily="sans-serif" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name) => [value, "Staff Count"]}
                      labelFormatter={(label) => `Age Band: ${label}`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {ageChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[C.primary, C.accent, C.info, C.success, C.warning][index % 5]}
                        />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>

                {data.filter(x => !x.dob_year).length > 0 && (
                  <p style={{ fontFamily: "sans-serif", fontSize: "0.72rem", color: C.muted, marginTop: "0.75rem", textAlign: "center" }}>
                    * {data.filter(x => !x.dob_year).length} staff record{data.filter(x => !x.dob_year).length !== 1 ? "s" : ""} excluded — date of birth not captured
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {view === "insights" && (
          <div className="grid-2">
            <div className="chart-container">
              <div className="sec-title"><MdTimeline size={12} /> Submission Trends</div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke={C.primary} strokeWidth={2} />
                  <Area type="monotone" dataKey="count" fill={C.primary} fillOpacity={0.1} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="sec-title"><FaChartBar size={12} /> Job Group Distribution</div>
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={jobGroupChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={C.info} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="sec-title"><FaGraduationCap size={12} /> Education vs Department</div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={DEPARTMENTS.map(dept => ({
                  name: dept,
                  degree: data.filter(x => x.department === dept && x.degree_name).length,
                  masters: data.filter(x => x.department === dept && x.masters_name).length
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="degree" fill={C.success} />
                  <Bar dataKey="masters" fill={C.accent} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <div className="sec-title"><FaPercent size={12} /> Gender Distribution</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="80%"
                  data={[
                    { name: "Male", value: byGender.Male, fill: "#4A90E2" },
                    { name: "Female", value: byGender.Female, fill: "#E25A6E" }
                  ]}
                >
                  <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === "records" && (
          <>
            {/* Desktop table */}
            <div className="card show-tbl" style={{ padding: 0, overflow: "hidden" }}>
              {loading
                ? <p style={{ fontFamily: "sans-serif", color: C.muted, textAlign: "center", padding: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><FaSpinner className="spin" />Loading…</p>
                : filtered.length === 0
                  ? <p style={{ padding: "2.5rem", textAlign: "center" }}><FaRegFileAlt size={48} style={{ marginBottom: 16, opacity: 0.5 }} /><br />No submissions found.</p>
                  : <div style={{ overflowX: "auto" }}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th onClick={() => handleSort("full_name")}>Name <SortIcon field="full_name" /></th>
                          <th onClick={() => handleSort("email")}>Email <SortIcon field="email" /></th>
                          <th onClick={() => handleSort("gender")}>Gender <SortIcon field="gender" /></th>
                          <th onClick={() => handleSort("department")}>Dept <SortIcon field="department" /></th>
                          <th onClick={() => handleSort("designation")}>Designation <SortIcon field="designation" /></th>
                          <th className="tbl-hide-mobile" onClick={() => handleSort("submitted_at")}>Submitted <SortIcon field="submitted_at" /></th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(row => (
                          <tr key={row.id}>
                            <td style={{ fontWeight: 600 }}>{row.full_name}<br /><span style={{ fontSize: "0.68rem", color: C.muted }}>{row.national_id}</span></td>
                            <td><FaEnvelope size={10} style={{ marginRight: 4 }} /> {row.email || "—"}</td>
                            <td>{row.gender === "Male" ? <FaMale color="#4A90E2" /> : <FaFemale color="#E25A6E" />} {row.gender}</td>
                            <td>{row.department}</td>
                            <td><span className="badge">{row.designation}</span></td>
                            <td className="tbl-hide-mobile" style={{ whiteSpace: "nowrap" }}>{row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : "—"}</td>
                            <td>
                              <div style={{ display: "flex", gap: "5px" }}>
                                <button className="btn-outline" style={{ padding: "4px 10px" }} onClick={() => setSelected(row)}>
                                  <FaEye size={10} /> View
                                </button>
                                <button
                                  className="btn-danger"
                                  style={{ padding: "4px 10px", background: C.danger, color: "#fff" }}
                                  onClick={() => openConfirmModal(row.id, row.full_name)}
                                  disabled={deleting === row.id}
                                >
                                  {deleting === row.id ? <FaSpinner className="spin" size={10} /> : <FaTrash size={10} />}
                                  {" Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
            </div>

            {/* Mobile cards */}
            <div className="show-cards">
              {loading
                ? <div style={{ fontFamily: "sans-serif", color: C.muted, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><FaSpinner className="spin" />Loading…</div>
                : filtered.length === 0
                  ? <div style={{ fontFamily: "sans-serif", color: C.muted, padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><FaUsers />No records found.</div>
                  : filtered.map((row) => (
                    <div className="rec-card" key={row.id}>
                      <div className="rec-card-header">
                        <div className="rec-avatar">{row.full_name?.charAt(0)?.toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: "0.9rem", color: C.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.full_name}</div>
                          <div style={{ fontFamily: "sans-serif", fontSize: "0.72rem", color: C.muted }}>{row.national_id}</div>
                        </div>
                      </div>
                      <div className="rec-card-body">
                        <div><div className="rec-field-lbl">Email</div><div className="rec-field-val">{row.email || "—"}</div></div>
                        <div><div className="rec-field-lbl">Gender</div><div className="rec-field-val" style={{ display: "flex", alignItems: "center", gap: 3 }}>{row.gender === "Male" ? <FaMale style={{ color: "#2563EB" }} /> : <FaFemale style={{ color: "#DB2777" }} />}{row.gender}</div></div>
                        <div><div className="rec-field-lbl">Department</div><div className="rec-field-val">{row.department}</div></div>
                        <div><div className="rec-field-lbl">Designation</div><div className="rec-field-val"><span className="badge">{row.designation}</span></div></div>
                        <div><div className="rec-field-lbl">Submitted</div><div className="rec-field-val">{row.submitted_at ? new Date(row.submitted_at).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</div></div>
                      </div>
                      <div className="rec-card-footer">
                        <button className="btn-outline" style={{ padding: "6px 12px", fontSize: "0.78rem" }} onClick={() => setSelected(row)}><FaEye /> View</button>
                        <button className="btn-danger" style={{ padding: "6px 12px", fontSize: "0.78rem" }} onClick={() => openConfirmModal(row.id, row.full_name)} disabled={deleting === row.id}>
                          {deleting === row.id ? <FaSpinner className="spin" /> : <FaTrash />} Delete
                        </button>
                      </div>
                    </div>
                  ))
              }
            </div>
          </>
        )}
      </div>

      {/* Detail Modal with improved layout */}
      {selected && (
        <div className="overlay no-print" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: C.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 700, color: C.primary, flexShrink: 0 }}>
                  {selected.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontFamily: "sans-serif", color: C.primary, fontSize: "1.1rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis" }}>{selected.full_name}</h2>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <span className="badge">{selected.designation}</span>
                    <span className="badge">{selected.department}</span>
                    {selected.tveta_reg_no && <span className="badge-green"><FaCertificate />{selected.tveta_reg_no}</span>}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-icon" onClick={handlePrint} title="Print Report">
                  <FaPrint size={18} />
                </button>
                <button
                  className="btn-icon btn-icon-danger"
                  onClick={() => openConfirmModal(selected.id, selected.full_name)}
                  disabled={deleting === selected.id}
                  title="Delete Record"
                >
                  {deleting === selected.id ? <FaSpinner className="spin" size={16} /> : <FaTrash size={16} />}
                </button>
                <button className="btn-icon" onClick={() => setSelected(null)} title="Close">
                  <FaTimes size={18} />
                </button>
              </div>
            </div>
            {[
              ["Personal", [[<FaUser />, "Full Name", selected.full_name], [<FaEnvelope />, "Email", selected.email], [<FaUser />, "Gender", selected.gender], [<FaIdCard />, "National ID", selected.national_id], [<FaCalendarAlt />, "Date of Birth", fmtDate(selected.dob_day, selected.dob_month, selected.dob_year)], [<FaInfoCircle />, "Disability", selected.disability], [<FaInfoCircle />, "Disability Nature", selected.disability_nature]]],
              ["Employment", [[<FaUserTie />, "Designation", selected.designation], [<FaBuilding />, "Department", selected.department], [<FaIdCard />, "Personal Number", selected.personal_number], [<FaBriefcase />, "Job Group", selected.job_group], [<FaCalendarAlt />, "Date of Appointment", fmtDate(selected.appointment_day, selected.appointment_month, selected.appointment_year)], [<FaCalendarAlt />, "Retirement/Expiry", fmtDate(selected.retirement_day, selected.retirement_month, selected.retirement_year)], [<FaClipboardList />, "Duties/Roles", selected.duties_roles], [<FaClipboardList />, "Responsibilities", selected.responsibilities]]],
              ["Qualifications", [[<FaBook />, "KCSE", selected.kcse_year ? `${selected.kcse_year} — ${selected.kcse_grade}` : ""], [<FaCertificate />, "Certificate", selected.cert_name ? `${selected.cert_name} (${selected.cert_year})` : ""], [<FaCertificate />, "Diploma", selected.diploma_name ? `${selected.diploma_name} (${selected.diploma_year})` : ""], [<FaGraduationCap />, "Degree", selected.degree_name ? `${selected.degree_name} (${selected.degree_year})` : ""], [<FaGraduationCap />, "Masters", selected.masters_name ? `${selected.masters_name} (${selected.masters_year})` : ""], [<FaGraduationCap />, "PhD", selected.phd_name ? `${selected.phd_name} (${selected.phd_year})` : ""]]],
              ["Professional", [
                [<FaChalkboardTeacher />, "Pedagogy", selected.pedagogy_year ? `${selected.pedagogy_year} — ${selected.pedagogy_grade}` : ""],
                [<FaChalkboardTeacher />, "ToT", selected.tot_year ? `${selected.tot_year} — ${selected.tot_grade}` : ""],
                [<FaChalkboardTeacher />, "Supervisory", selected.superv_year ? `${selected.superv_year} — ${selected.superv_grade}` : ""],
                [<FaChalkboardTeacher />, "Senior Management", selected.senior_mgmt_year ? `${selected.senior_mgmt_year} — ${selected.senior_mgmt_grade}` : ""],
                [<FaChalkboardTeacher />, "SLDP", selected.sldp_year ? `${selected.sldp_year} — ${selected.sldp_grade}` : ""],
                [<FaChalkboardTeacher />, "Retirement Course", selected.retire_course_year ? `${selected.retire_course_year} — ${selected.retire_course_grade}` : ""],
                ...((() => {
                  try {
                    const courses = JSON.parse(selected.other_courses || "[]");
                    return courses.map((c, i) => [
                      <FaChalkboardTeacher />,
                      `Other Course ${i + 1}`,
                      c.desc ? `${c.desc}${c.year ? ` (${c.year})` : ""}${c.grade ? ` — ${c.grade}` : ""}` : ""
                    ]);
                  } catch { return []; }
                })()),
                [<FaCertificate />, "TVETA Reg No.", selected.tveta_reg_no],
                [<FaCalendarAlt />, "TVETA Registered", selected.tveta_date],
                [<FaCalendarAlt />, "TVETA Expiry", selected.tveta_expiry],
              ]],
            ].map(([sec, fields]) => (
              <div key={sec} style={{ marginBottom: "1.25rem" }}>
                <div className="sec-title">{sec}</div>
                {fields.filter(([, , v]) => v).map(([icon, k, v]) => (
                  <div className="rev-row" key={k}>
                    <span className="rev-key">{icon} {k}</span>
                    <span className="rev-val">{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState(() => {
    try {
      const saved = sessionStorage.getItem("nysei_admin");
      return saved ? "dashboard" : "form";
    } catch { return "form"; }
  });

  const [admin, setAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem("nysei_admin");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  return (
    <div className="app">
      <style>{css}</style>
      <header className="header no-print">
        <div className="header-inner">
          <div className="header-logo">
            <img src={LOGO} alt="NYS Logo" />
            <div>
              <div className="header-title">NYS Engineering Institute</div>
              <div className="header-sub">Staff Data Collection Platform</div>
            </div>
          </div>
          <div className="header-actions">
            {screen !== "form" && <button className="btn-ghost" onClick={() => setScreen("form")}><FaClipboardList size={12} /> Form</button>}
            {screen === "form" && <button className="btn-ghost" onClick={() => setScreen(admin ? "dashboard" : "login")}><FaUserShield size={12} /> Admin</button>}
            {screen === "login" && <span className="badge-accent"><FaLock size={10} /> Login</span>}
            {screen === "dashboard" && <span className="badge-accent"><FaUserShield size={10} /> {admin?.role}</span>}
          </div>
        </div>
      </header>
      {screen === "form" && <DataForm />}

      {screen === "login" && <Login onLogin={u => {
        sessionStorage.setItem("nysei_admin", JSON.stringify(u));
        setAdmin(u);
        setScreen("dashboard");
      }} />}
      {screen === "dashboard" && admin && <Dashboard admin={admin} onLogout={() => {
        sessionStorage.removeItem("nysei_admin");
        setAdmin(null);
        setScreen("form");
      }} />}
    </div>
  );
}