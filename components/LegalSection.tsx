import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scale, FileText, ChevronDown } from 'lucide-react';

const licenceSections: { title: string; items?: string[]; paragraphs?: string[]; paragraphs2?: string[] }[] = [
  {
    title: '1. Licence Grant',
    paragraphs: [
      'Subject to your compliance with this Licence, Cordoval grants you a limited, non-exclusive, non-transferable, revocable licence to download, install and use the Software for lawful personal or commercial purposes.',
      'The Software is provided free of charge unless otherwise stated by Cordoval.',
      'This Licence does not transfer ownership of the Software to you.',
    ],
  },
  {
    title: '2. Proprietary Software',
    paragraphs: [
      'The Software is proprietary software owned by or licensed to Cordoval.',
      'The Software is not open-source software.',
      'You are not granted any right to access, obtain or distribute the source code of the Software except where such rights are expressly provided by applicable law or by a separate written agreement with Cordoval.',
      'All rights not expressly granted under this Licence are reserved by Cordoval.',
    ],
  },
  {
    title: '3. Permitted Use',
    paragraphs: ['You may:'],
    items: [
      'Download the Software from an authorised distribution source.',
      'Install the Software on devices that you own or are authorised to use.',
      'Use the Software for personal purposes.',
      'Use the Software for commercial and business purposes.',
      'Make reasonable backup copies of the Software for your own use where permitted by applicable law.',
    ],
  },
  {
    title: '4. Restrictions',
    paragraphs: ['Except where expressly permitted by this Licence or applicable law, you must not:'],
    items: [
      'Sell or resell the Software.',
      'Rent, lease or sublicense the Software.',
      'Redistribute copies of the Software.',
      'Upload the Software to unauthorised download or file-sharing services.',
      'Publicly mirror or republish the Software.',
      'Modify, adapt or create derivative works of the Software.',
      'Remove copyright, trademark or proprietary notices.',
      'Circumvent technical restrictions intentionally implemented by Cordoval.',
      'Use the Software to create a substantially similar competing product through unauthorised copying of protected materials.',
      'Represent the Software as your own product.',
      'Use Cordoval branding in a way that suggests endorsement or affiliation without permission.',
    ],
    paragraphs2: ['Nothing in this section restricts rights that cannot legally be restricted under applicable law.'],
  },
  {
    title: '5. Reverse Engineering',
    paragraphs: [
      'You must not reverse engineer, decompile or disassemble the Software except to the extent that applicable law expressly permits such activity despite this restriction.',
      'Where applicable law permits such activity, any information obtained must only be used for the purposes permitted by that law.',
    ],
  },
  {
    title: '6. Updates',
    paragraphs: ['Cordoval may provide updates, patches, improvements and new versions of the Software.', 'Updates may include:'],
    items: [
      'Bug fixes',
      'Security improvements',
      'New features',
      'Performance improvements',
      'Changes to functionality',
      'Removal or modification of features',
    ],
    paragraphs2: [
      'Cordoval may provide updates automatically or require you to install them manually.',
      'We do not guarantee that every feature will remain available indefinitely.',
    ],
  },
  {
    title: '7. Third-Party Software',
    paragraphs: [
      'The Software may contain or interact with third-party software, libraries, frameworks, services or technologies.',
      'Such components may be governed by separate licence terms.',
      'Where applicable, those terms will take precedence over this Licence in relation to the relevant third-party component.',
    ],
  },
  {
    title: '8. User Data',
    paragraphs: [
      'Cordoval may provide software that stores information locally on your device.',
      'You are responsible for maintaining appropriate backups of important information.',
      'Unless expressly stated otherwise, Cordoval does not guarantee that data stored through the Software will be recoverable following:',
    ],
    items: [
      'Hardware failure',
      'Operating-system failure',
      'User error',
      'Accidental deletion',
      'Malware or other security incidents',
      'Corruption',
      'Unauthorised access',
      'Loss or damage to the device',
    ],
    paragraphs2: ['You should maintain independent backups of important business or personal data.'],
  },
  {
    title: '9. AI Features',
    paragraphs: [
      'Some Cordoval products may contain artificial intelligence features.',
      'AI-generated information may be inaccurate, incomplete, outdated or unsuitable for your particular circumstances.',
      'You are responsible for reviewing and verifying AI-generated content before relying upon it.',
      'Cordoval does not guarantee that AI-generated information is accurate or suitable for any particular purpose.',
      'The Software should not be relied upon as a substitute for professional legal, financial, medical, accounting or other specialist advice.',
    ],
  },
  {
    title: '10. No Guarantee of Results',
    paragraphs: ['Cordoval software is provided as a tool.', 'We do not guarantee that using the Software will result in:'],
    items: [
      'Increased revenue',
      'Increased productivity',
      'Business growth',
      'Financial returns',
      'Successful projects',
      'Successful marketing campaigns',
      'Successful investments',
      'Any particular business outcome',
    ],
    paragraphs2: ['You remain responsible for decisions made using the Software.'],
  },
  {
    title: '11. Availability',
    paragraphs: [
      'We may modify, suspend or discontinue the Software or any particular feature at any time.',
      'We will endeavour to maintain and improve our products but do not guarantee uninterrupted availability or compatibility with every device or operating system.',
    ],
  },
  {
    title: '12. Disclaimer',
    paragraphs: [
      'To the maximum extent permitted by applicable law, the Software is provided on an "as available" and "as is" basis.',
      'We do not guarantee that the Software will:',
    ],
    items: [
      'Be completely error-free.',
      'Be uninterrupted.',
      'Work with every hardware configuration.',
      'Work with every operating system version.',
      'Meet every individual requirement.',
      'Be permanently available.',
    ],
    paragraphs2: ['Nothing in this Licence excludes or limits any legal right or liability that cannot lawfully be excluded or limited.'],
  },
  {
    title: '13. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by applicable law, Cordoval shall not be liable for indirect, incidental, special or consequential losses arising from your use of the Software, including loss of profits, revenue, business opportunities, data or goodwill.',
      'Nothing in this Licence excludes or limits liability for matters that cannot legally be excluded or limited under applicable law.',
    ],
  },
  {
    title: '14. Termination',
    paragraphs: [
      'This Licence remains in effect until terminated.',
      'Your rights under this Licence may automatically terminate if you materially breach its terms.',
      'Upon termination, you must cease any use of the Software that is no longer permitted.',
      'Termination does not affect rights or obligations that arose before termination.',
    ],
  },
  {
    title: '15. Intellectual Property',
    paragraphs: [
      'All intellectual property rights in the Software, including copyright, trademarks, designs, branding and associated materials, remain the property of Cordoval or its licensors.',
      'Nothing in this Licence grants you ownership of those rights.',
    ],
  },
  {
    title: '16. Changes to This Licence',
    paragraphs: [
      'Cordoval may update this Licence from time to time.',
      'The latest version will be made available through the relevant Cordoval website or Software.',
      'Continued use of the Software following changes may constitute acceptance of the updated Licence to the extent permitted by applicable law.',
    ],
  },
  {
    title: '17. Governing Law',
    paragraphs: [
      'This Licence shall be governed by the laws of England and Wales, subject to any mandatory consumer protections or other legal rights that apply to you under the law of your jurisdiction.',
    ],
  },
];

const termsSections: { title: string; items?: string[]; paragraphs?: string[]; paragraphs2?: string[] }[] = [
  {
    title: '1. About Cordoval',
    paragraphs: [
      'Cordoval develops and distributes software products, digital tools and custom software solutions.',
      'Our services may include:',
    ],
    items: [
      'Cordoval OS',
      'Cordoval Browser',
      'Cordoval Agent OS',
      'Cordoval Game Development Software',
      'Cordoval Store',
      'Cordoval Custom Software Services',
      'Other current or future Cordoval products and services.',
    ],
  },
  {
    title: '2. Acceptance',
    paragraphs: [
      'By accessing or using a Cordoval website or service, you agree to these Terms.',
      'If you do not agree, you should discontinue use of the relevant service.',
    ],
  },
  {
    title: '3. Free Software',
    paragraphs: [
      'Some Cordoval software is provided free of charge.',
      'Free availability does not mean the software is open source.',
      'Free software remains proprietary to Cordoval and is subject to the applicable Software Licence.',
    ],
  },
  {
    title: '4. Downloads',
    paragraphs: ['Cordoval may provide downloads through:'],
    items: [
      'The Cordoval website',
      'GitHub',
      'itch.io',
      'Other authorised distribution platforms',
      'Other third-party software distribution services.',
    ],
    paragraphs2: [
      'We cannot guarantee that third-party platforms will remain available or unchanged.',
      'You should obtain Cordoval software from trusted distribution sources where possible.',
    ],
  },
  {
    title: '5. Support',
    paragraphs: [
      'Cordoval may provide documentation, community support, email support or other assistance.',
      'Unless expressly agreed otherwise, free software does not include a guaranteed level of technical support.',
    ],
  },
  {
    title: '6. Custom Software',
    paragraphs: [
      'Cordoval may provide bespoke software development services to businesses and other customers.',
      'Custom projects may be subject to separate written contracts governing:',
    ],
    items: [
      'Scope',
      'Fees',
      'Payment schedules',
      'Intellectual property',
      'Confidentiality',
      'Delivery',
      'Testing',
      'Hosting',
      'Maintenance',
      'Support',
      'Changes to requirements.',
    ],
    paragraphs2: ['Where a separate agreement exists, that agreement will govern the relevant custom project.'],
  },
  {
    title: '7. Payments',
    paragraphs: [
      'Where Cordoval charges for products or services, prices and payment terms will be displayed or agreed before purchase.',
      'For custom projects, Cordoval may require deposits or staged payments before work begins.',
    ],
  },
  {
    title: '8. Donations and Support',
    paragraphs: [
      'Cordoval may provide optional ways for users to financially support development.',
      'Such contributions are voluntary unless explicitly described as payment for a product or service.',
    ],
  },
  {
    title: '9. Acceptable Use',
    paragraphs: [
      'You must not use Cordoval services for unlawful activities or activities that infringe the rights of others.',
      'You must not knowingly:',
    ],
    items: [
      'Attack or compromise Cordoval systems.',
      'Attempt to gain unauthorised access to accounts or systems.',
      'Distribute malware through Cordoval services.',
      'Abuse Cordoval infrastructure.',
      'Impersonate Cordoval or its representatives.',
      'Use Cordoval services to facilitate unlawful activity.',
    ],
  },
  {
    title: '10. Third-Party Services',
    paragraphs: [
      'Cordoval may integrate with or link to third-party services.',
      'Cordoval does not control those services and is not responsible for their availability, content, policies or operation.',
      'Your use of third-party services may be governed by their own terms.',
    ],
  },
  {
    title: '11. Intellectual Property',
    paragraphs: [
      'Cordoval and its licensors retain ownership of Cordoval\'s software, websites, branding, trademarks, designs, documentation and other intellectual property unless expressly agreed otherwise.',
      'The name Cordoval and associated branding may not be used in a manner that falsely suggests endorsement, sponsorship or affiliation.',
    ],
  },
  {
    title: '12. User Content',
    paragraphs: [
      'Where Cordoval services allow users to upload or create content, you retain ownership of content that you own.',
      'You grant Cordoval only the permissions reasonably necessary to provide the relevant service, unless a separate agreement states otherwise.',
      'You are responsible for ensuring that content you upload does not infringe the rights of others.',
    ],
  },
  {
    title: '13. Security',
    paragraphs: [
      'You are responsible for maintaining reasonable security of your devices, accounts and credentials.',
      'Cordoval recommends keeping software and operating systems updated and maintaining appropriate backups.',
    ],
  },
  {
    title: '14. Disclaimer',
    paragraphs: [
      'To the maximum extent permitted by law, Cordoval does not guarantee that its websites or services will always be available, uninterrupted, secure or error-free.',
      'Nothing in these Terms excludes or limits rights or liabilities that cannot legally be excluded or limited.',
    ],
  },
  {
    title: '15. Liability',
    paragraphs: [
      'To the maximum extent permitted by applicable law, Cordoval shall not be responsible for indirect or consequential losses arising from your use of its services.',
      'This does not exclude or limit liability where doing so would be unlawful.',
    ],
  },
  {
    title: '16. Changes',
    paragraphs: [
      'Cordoval may modify these Terms as its services develop.',
      'Updated Terms will be published through the relevant Cordoval website.',
    ],
  },
  {
    title: '17. Suspension and Termination',
    paragraphs: [
      'Cordoval may suspend access to services where reasonably necessary to protect its systems, users or business, or where a user materially breaches these Terms.',
    ],
  },
  {
    title: '18. Governing Law',
    paragraphs: [
      'These Terms are governed by the laws of England and Wales, subject to mandatory legal protections applicable to consumers in their jurisdiction.',
    ],
  },
];

interface LegalDocProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: { title: string; items?: string[]; paragraphs?: string[]; paragraphs2?: string[] }[];
  icon: React.ReactNode;
  accent: string;
  defaultOpen?: boolean;
}

const LegalDoc: React.FC<LegalDocProps> = ({ title, subtitle, lastUpdated, sections, icon, accent, defaultOpen }) => {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-6 sm:p-8 text-left transition-colors hover:bg-slate-100/60 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${accent} rounded-2xl flex items-center justify-center shadow-sm shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {subtitle} &middot; Last updated: {lastUpdated}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-400 shrink-0">
          <ChevronDown size={20} />
        </motion.div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="px-6 sm:px-8 pb-8"
        >
          <div className="max-h-[420px] overflow-y-auto pr-4 space-y-6 border-t border-slate-200/70 pt-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2">{section.title}</h4>
                {section.paragraphs?.map((p) => (
                  <p key={p} className="text-[13px] text-slate-600 font-medium leading-relaxed mb-2">{p}</p>
                ))}
                {section.items && (
                  <ul className="space-y-1.5 mb-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13px] text-slate-600 font-medium leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-slate-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.paragraphs2?.map((p) => (
                  <p key={p} className="text-[13px] text-slate-600 font-medium leading-relaxed mb-2">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const LegalSection: React.FC = () => {
  return (
    <section className="bg-white rounded-[3rem] p-8 sm:p-12 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Scale size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Legal, Terms & Licence</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cordoval Governing Documents</p>
        </div>
      </div>

      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl mb-8">
        Cordoval operates under the following legal documents. These are the latest versions and apply to all Cordoval software, websites and services. Expand each document to read it in full.
      </p>

      <div className="space-y-6">
        <LegalDoc
          title="CORDOVAL SOFTWARE LICENCE AGREEMENT"
          subtitle="Software Licence"
          lastUpdated="16/8/2016"
          sections={licenceSections}
          icon={<FileText size={24} />}
          accent="bg-amber-100 text-amber-600"
          defaultOpen
        />

        <LegalDoc
          title="CORDOVAL TERMS OF USE"
          subtitle="Terms of Use"
          lastUpdated="16/8/2026"
          sections={termsSections}
          icon={<FileText size={24} />}
          accent="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact</p>
        <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
          Cordoval &middot; Website: <span className="font-black text-slate-800">cordoval.work</span> &middot; For legal or business enquiries: <span className="font-black text-slate-800">cordoval.work@gmail.com</span>
        </p>
      </div>
    </section>
  );
};