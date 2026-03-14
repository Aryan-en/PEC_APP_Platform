const fs = require('fs');

const filesToFix = [
    './src/views/LeaveManagement.tsx',
    './src/views/Library.tsx',
    './src/views/RoomBooking.tsx',
    './src/views/ResumeBuilderIvyLeague.tsx'
];

filesToFix.forEach(f => {
    if(!fs.existsSync(f)) return;
    let c = fs.readFileSync(f, 'utf8');
    
    // Fix duplicate 'db' imports
    if(c.split('import { db').length > 2 || c.split('import {db').length > 2) {
       // Remove the auto-injected ones at the top if they are duplicates of local ones
       let lines = c.split('\n');
       let dbImportCount = 0;
       lines = lines.filter(line => {
           if(line.includes('import {') && line.includes('db') && line.includes('firebase')) {
               dbImportCount++;
               if(dbImportCount > 1) return false;
           }
           if (line.includes('import { doc, getDoc, updateDoc } from "firebase/firestore";') && f.includes('ResumeBuilderIvyLeague')) {
               return false; // Remove auto injected duplicated doc, getDoc
           }
           return true;
       });
       c = lines.join('\n');
    }
    fs.writeFileSync(f, c);
});

// Fix RolePermissions
const rolePermFile = './src/lib/rolePermissions.ts';
if(fs.existsSync(rolePermFile)) {
    let rp = fs.readFileSync(rolePermFile, 'utf8');
    if(!rp.includes('canSwitchOrganizations?: boolean;')) {
        rp = rp.replace('export interface RolePermissions {', 'export interface RolePermissions {\n  canSwitchOrganizations?: boolean;');
        fs.writeFileSync(rolePermFile, rp);
    }
}

// Fix pdfjs-dist in ResumeBuilderIvyLeague
const resumeBuilder = './src/views/ResumeBuilderIvyLeague.tsx';
if(fs.existsSync(resumeBuilder)) {
    let rb = fs.readFileSync(resumeBuilder, 'utf8');
    rb = rb.replace("import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';", 
                    "// @ts-ignore\nimport pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs';");
    fs.writeFileSync(resumeBuilder, rb);
}

// Fix missing default exports
const cm = './src/views/admin/CanteenManager.tsx';
if(fs.existsSync(cm)) {
    let c = fs.readFileSync(cm, 'utf8');
    c = c.replace('export function CanteenManager', 'export default function CanteenManager');
    c = c.replace('export const CanteenManager', 'export default function CanteenManager');
    fs.writeFileSync(cm, c);
}

const nc = './src/views/NightCanteen.tsx';
if(fs.existsSync(nc)) {
    let c = fs.readFileSync(nc, 'utf8');
    c = c.replace('export function NightCanteen', 'export default function NightCanteen');
    c = c.replace('export const NightCanteen', 'export default function NightCanteen');
    fs.writeFileSync(nc, c);
}

console.log("Fixes applied.");
