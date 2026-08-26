"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Showcase() {
  const projects = [
    {
      title: "Good Fella",
      category: "Creative Agency & Studio",
      awards: ["Awwwards SOTD", "FWA of the Day"],
      url: "https://good-fella.com/",
    },
    {
      title: "House of Honey",
      category: "Interior Architecture & Design",
      awards: ["CSSDA Special Kudos"],
      url: "https://www.houseofhoney.com/",
    },
    {
      title: "Aspen Search",
      category: "Executive Search & Talent",
      awards: ["Awwwards Honors"],
      url: "https://www.aspensearch.com/",
    },
    {
      title: "Serve Robotics",
      category: "Autonomous Delivery Robotics",
      awards: ["Awwwards Nominee"],
      url: "https://www.serverobotics.com/",
    },
    {
      title: "Muralia",
      category: "Architectural Surface Finish",
      awards: ["CSSDA Best UI"],
      url: "https://www.muralia.at/",
    },
    {
      title: "blink",
      category: "Fintech & Global Trading",
      awards: ["FWA of the Day"],
      url: "https://www.blink.trade/",
    },
  ];

  return (
    <section id="showcase" className="relative w-full bg-[#0A0A0A] bg-dots text-white py-28 sm:py-36 px-6 sm:px-12 lg:px-20 border-b border-white/10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 sm:mb-24">
          <div className="flex items-center gap-2 font-mono text-xs text-[#8E8E93] uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>003 / SHOWCASE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight">
            The work that gets remembered.
          </h2>
          <p className="text-ghost-grey text-base sm:text-lg max-w-2xl mt-4 font-normal">
            Real sites shipped on The Content Architecture. With the plumbing already handled, the effort goes where it shows. Recognized across <strong>Awwwards</strong>, <strong>FWA</strong>, and <strong>CSSDA</strong>.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group p-8 rounded-6 border border-white/10 bg-[#121212] hover:border-white/30 hover:bg-[#181818] transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3 uppercase tracking-wider">
                  <span>0{index + 1} // PROJECT</span>
                  <span className="text-white/30 group-hover:text-white transition-colors">↗</span>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#FF5500] transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs font-mono text-ghost-grey uppercase tracking-wider mt-1">
                  {project.category}
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                {project.awards.map((award) => (
                  <span
                    key={award}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-white/70 uppercase tracking-widest"
                  >
                    {award}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
