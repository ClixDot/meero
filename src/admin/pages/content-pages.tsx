'use client';

/** Workspace editors: Home, About, Services, Careers, Contact, Gallery + settings documents. */
import React, { useState } from 'react';
import DocEditor from '../editor/DocEditor';
import CollectionEditor from '../editor/CollectionEditor';
import { useCmsCtx } from '../editor/useCmsCtx';
import { Tabs } from '../ui/kit';
import {
  aboutSchema, careersPageSchema, companySchema, contactPageSchema, designSchema, galleryFields, galleryPageSchema,
  generalSchema, headerFooterSchema, homeSchema, seoSchema, serviceFields, servicesPageSchema,
} from '../schemas';
import { newId } from '../editor/fields';

export function HomeEditor() {
  const ctx = useCmsCtx();
  return <DocEditor contentKey="home" title="Home page" description="Edit every section of the home page. Pick a section on the left. Turn off “Shown on site” to hide it." sections={homeSchema} previewPath="/" ctx={ctx} />;
}

export function AboutEditor() {
  return <DocEditor contentKey="about" title="About page" description="Company story, mission, vision and values." sections={aboutSchema} previewPath="/about" />;
}

export function ServicesEditor() {
  const [tab, setTab] = useState<'categories' | 'page'>('categories');
  return (
    <div className="space-y-5">
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'categories', label: 'Service categories' }, { value: 'page', label: 'Services page copy' }]} />
      {tab === 'categories' ? (
        <CollectionEditor
          contentKey="services"
          title="Service categories"
          description="The recruitment sectors shown on Home, Services, the footer and the Careers filter."
          itemLabel="Service"
          fields={serviceFields}
          itemTitle={(s) => s.title}
          itemSubtitle={(s) => s.description}
          imageKey="image"
          idPrefix="service"
          newItem={() => ({ id: newId('service'), title: '', description: '', icon: 'Building2', image: '', highlights: [] })}
          searchKeys={['title', 'description']}
          previewPath="/services"
        />
      ) : (
        <DocEditor contentKey="servicesPage" title="Services page" description="Hero banner, card buttons and the closing call to action." sections={servicesPageSchema} previewPath="/services" />
      )}
    </div>
  );
}

export function CareersPageEditor() {
  return <DocEditor contentKey="careersPage" title="Careers page" description="Hero, filters and the drives banner. Vacancies are managed in Job Listings." sections={careersPageSchema} previewPath="/careers" />;
}

export function ContactEditor() {
  const [tab, setTab] = useState<'details' | 'page'>('details');
  return (
    <div className="space-y-5">
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'details', label: 'Contact details' }, { value: 'page', label: 'Contact page copy' }]} />
      {tab === 'details' ? (
        <DocEditor contentKey="company" title="Contact details" description="Phone, email, WhatsApp, address and map. Used across the whole website." sections={companySchema} previewPath="/contact" />
      ) : (
        <DocEditor contentKey="contactPage" title="Contact page" description="Headings and text on the Contact page." sections={contactPageSchema} previewPath="/contact" />
      )}
    </div>
  );
}

export function GalleryEditor() {
  const ctx = useCmsCtx();
  const [tab, setTab] = useState<'photos' | 'page'>('photos');
  return (
    <div className="space-y-5">
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'photos', label: 'Photos' }, { value: 'page', label: 'Page & categories' }]} />
      {tab === 'photos' ? (
        <CollectionEditor
          contentKey="gallery"
          title="Gallery"
          description="Add, replace, reorder, categorise and publish photos."
          itemLabel="Photo"
          fields={galleryFields}
          itemTitle={(g) => g.title}
          itemSubtitle={(g) => `${g.category} · ${g.location}`}
          imageKey="image"
          idPrefix="photo"
          newItem={() => ({ title: '', category: ctx.categories?.[0] ?? '', location: '', image: '', thumbnail: '', alt: '' })}
          searchKeys={['title', 'location', 'category', 'alt']}
          filter={{ key: 'category', label: 'Categories', options: (c) => c.categories ?? [] }}
          ctx={ctx}
          gridView
          previewPath="/gallery"
        />
      ) : (
        <DocEditor contentKey="galleryPage" title="Gallery page" description="Hero banner and photo categories." sections={galleryPageSchema} previewPath="/gallery" />
      )}
    </div>
  );
}

export function HeaderFooterEditor() {
  return <DocEditor contentKey="headerFooter" title="Header & footer" description="Logo, header button, footer text and social links." sections={headerFooterSchema} previewPath="/" />;
}

export function SeoEditor() {
  return <DocEditor contentKey="seo" title="SEO" description="Meta titles, descriptions, keywords, social images and canonical URLs. Applied in visitors’ browsers now; search-engine crawlers see these after the database phase (server rendering)." sections={seoSchema} />;
}

export function DesignEditor() {
  return <DocEditor contentKey="design" title="Design & branding" description="Brand colours, fonts and heading size for the public website." sections={designSchema} previewPath="/" />;
}

export function GeneralSettingsEditor() {
  return <DocEditor contentKey="general" title="Site-wide options" description="Announcement bar, floating WhatsApp button and notification settings." sections={generalSchema} previewPath="/" />;
}
