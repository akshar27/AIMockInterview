const extractLanguages = (description) => {
    const techKeywords = [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Ruby",
      "PHP", "Swift", "Kotlin", "SQL", "NoSQL", "Node.js", "React", "Vue",
      "Angular", "Django", "Flask", "Spring", "Express", "MongoDB", "MySQL",
      "PostgreSQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "GraphQL"
    ];
  
    const matched = techKeywords.filter(keyword =>
      new RegExp(`\\b${keyword}\\b`, 'i').test(description)
    );
  
    return [...new Set(matched)];
  };
  
  module.exports = extractLanguages;
  