"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPhoneAlt, FaEnvelope, FaMapMarkedAlt } from "react-icons/fa";

const ContactSection = ({ portfolio }) => {
  const contact = portfolio.contact || {};
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const info = [
    contact.phone && { icon: <FaPhoneAlt />, title: "Phone", description: contact.phone },
    contact.email && { icon: <FaEnvelope />, title: "Email", description: contact.email },
    contact.address && { icon: <FaMapMarkedAlt />, title: "Address", description: contact.address },
  ].filter(Boolean);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Without a contact-submission backend, compose a mailto to the owner.
  const onSubmit = (e) => {
    e.preventDefault();
    const to = contact.email;
    if (!to) return;
    const subject = `Portfolio enquiry from ${form.firstname} ${form.lastname}`.trim();
    const body = [
      `Name: ${form.firstname} ${form.lastname}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Service: ${form.service}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 1.5, duration: 0.4, ease: "easeIn" } }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col xl:flex-row gap-[25px]">
          <div className="xl:w-[60%] order-2 xl:order-none">
            <form onSubmit={onSubmit} className="flex flex-col gap-4 p-6 bg-[#27272c] rounded-xl">
              <h3 className="text-3xl text-accent">{contact.heading || "Let's work together"}</h3>
              <p className="text-white/60">{contact.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Firstname" value={form.firstname} onChange={update("firstname")} />
                <Input placeholder="Lastname" value={form.lastname} onChange={update("lastname")} />
                <Input type="email" placeholder="Email address" value={form.email} onChange={update("email")} />
                <Input placeholder="Phone number" value={form.phone} onChange={update("phone")} />
              </div>
              {(contact.services || []).length > 0 && (
                <Select onValueChange={(v) => setForm((f) => ({ ...f, service: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a service</SelectLabel>
                      {contact.services.map((s, i) => (
                        <SelectItem key={i} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              <Textarea
                className="h-[160px]"
                placeholder="Type your message here."
                value={form.message}
                onChange={update("message")}
              />
              <Button type="submit" size="sm" className="max-w-40" disabled={!contact.email}>
                Send message
              </Button>
              {!contact.email && (
                <p className="text-xs text-white/40">Contact email not set by the owner.</p>
              )}
            </form>
          </div>
          <div className="flex-1 flex items-center xl:justify-center order-1 xl:order-none mb-8 xl:mb-0">
            <ul className="flex flex-col gap-10">
              {info.map((item, index) => (
                <li key={index} className="flex items-center gap-6">
                  <div className="w-[52px] h-[52px] xl:w-[72px] xl:h-[72px] bg-[#27272c] text-accent rounded-md flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{item.title}</p>
                    <h3 className="text-lg">{item.description}</h3>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContactSection;
