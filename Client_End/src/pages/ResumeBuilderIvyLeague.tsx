import { useMemo, useState } from "react";
import { Plus, Trash2, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  duration: string;
  points: string;
}

export default function ResumeBuilderIvyLeague() {
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Chandigarh, India");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/johndoe");
  const [github, setGithub] = useState("github.com/johndoe");
  const [summary, setSummary] = useState(
    "Final-year Computer Science student focused on full-stack development, performance optimization, and product-quality UI engineering.",
  );
  const [skills, setSkills] = useState("React, TypeScript, Node.js, Firebase, SQL, Tailwind CSS");

  const [education, setEducation] = useState<EducationItem[]>([
    { id: crypto.randomUUID(), school: "Punjab Engineering College", degree: "B.Tech CSE", year: "2022 - 2026" },
  ]);

  const [experience, setExperience] = useState<ExperienceItem[]>([
    {
      id: crypto.randomUUID(),
      title: "Frontend Intern",
      company: "Tech Innovations",
      duration: "Jun 2025 - Aug 2025",
      points: "Built reusable dashboard components. Improved load time by 32%. Collaborated with backend team on API contracts.",
    },
  ]);

  const parsedSkills = useMemo(
    () => skills.split(",").map((s) => s.trim()).filter(Boolean),
    [skills],
  );

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      { id: crypto.randomUUID(), school: "", degree: "", year: "" },
    ]);
  };

  const addExperience = () => {
    setExperience((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "", company: "", duration: "", points: "" },
    ]);
  };

  const updateEducation = (id: string, key: keyof EducationItem, value: string) => {
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  };

  const updateExperience = (id: string, key: keyof ExperienceItem, value: string) => {
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, [key]: value } : e)));
  };

  const removeEducation = (id: string) => setEducation((prev) => prev.filter((e) => e.id !== id));
  const removeExperience = (id: string) => setExperience((prev) => prev.filter((e) => e.id !== id));

  const downloadJson = () => {
    const payload = {
      fullName,
      email,
      phone,
      location,
      linkedin,
      github,
      summary,
      skills: parsedSkills,
      education,
      experience,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
          <p className="text-sm text-muted-foreground">Edit on the left, preview on the right.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
          </Button>
          <Button onClick={downloadJson}>
            <Download className="w-4 h-4 mr-2" /> Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card-elevated p-5 space-y-6">
          <section className="space-y-3">
            <h2 className="font-semibold">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn" />
              <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="GitHub" />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Summary</h2>
            <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </section>

          <section className="space-y-3">
            <h2 className="font-semibold">Skills</h2>
            <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Comma separated skills" />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Education</h2>
              <Button size="sm" variant="outline" onClick={addEducation}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
            {education.map((e) => (
              <div key={e.id} className="border border-border rounded-lg p-3 space-y-2">
                <Input value={e.school} onChange={(ev) => updateEducation(e.id, "school", ev.target.value)} placeholder="School" />
                <Input value={e.degree} onChange={(ev) => updateEducation(e.id, "degree", ev.target.value)} placeholder="Degree" />
                <div className="flex gap-2">
                  <Input value={e.year} onChange={(ev) => updateEducation(e.id, "year", ev.target.value)} placeholder="Year" />
                  <Button size="icon" variant="ghost" onClick={() => removeEducation(e.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Experience</h2>
              <Button size="sm" variant="outline" onClick={addExperience}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </div>
            {experience.map((e) => (
              <div key={e.id} className="border border-border rounded-lg p-3 space-y-2">
                <Input value={e.title} onChange={(ev) => updateExperience(e.id, "title", ev.target.value)} placeholder="Role" />
                <Input value={e.company} onChange={(ev) => updateExperience(e.id, "company", ev.target.value)} placeholder="Company" />
                <Input value={e.duration} onChange={(ev) => updateExperience(e.id, "duration", ev.target.value)} placeholder="Duration" />
                <Textarea
                  rows={3}
                  value={e.points}
                  onChange={(ev) => updateExperience(e.id, "points", ev.target.value)}
                  placeholder="Use sentences separated by periods."
                />
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => removeExperience(e.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </section>
        </div>

        <div id="resume-preview" className="card-elevated p-6 bg-background">
          <h2 className="text-2xl font-bold tracking-tight">{fullName || "Your Name"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {email} | {phone} | {location}
          </p>
          <p className="text-sm text-muted-foreground">{linkedin} | {github}</p>

          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider">Summary</h3>
            <p className="mt-1 text-sm leading-relaxed">{summary}</p>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {parsedSkills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider">Education</h3>
            <div className="mt-2 space-y-2">
              {education.map((e) => (
                <div key={e.id}>
                  <p className="font-medium text-sm">{e.school}</p>
                  <p className="text-sm text-muted-foreground">{e.degree} | {e.year}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider">Experience</h3>
            <div className="mt-2 space-y-3">
              {experience.map((e) => (
                <div key={e.id}>
                  <p className="font-medium text-sm">{e.title} - {e.company}</p>
                  <p className="text-xs text-muted-foreground">{e.duration}</p>
                  <ul className="list-disc ml-5 mt-1 text-sm space-y-1">
                    {e.points.split(".").map((point, idx) => {
                      const clean = point.trim();
                      if (!clean) return null;
                      return <li key={`${e.id}-${idx}`}>{clean}</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}