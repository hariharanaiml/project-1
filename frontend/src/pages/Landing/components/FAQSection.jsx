import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Container from '../../../components/common/Container';

const faqs = [
  {
    question: 'What is RoadSense AI?',
    answer:
      'RoadSense AI is an AI-powered infrastructure monitoring platform that uses computer vision and machine learning to detect, analyze, and manage road damage. It enables municipalities and engineers to identify potholes, cracks, and surface defects in real-time, prioritize repairs, and make data-driven decisions.',
  },
  {
    question: 'How does AI detect road damage?',
    answer:
      'Our platform uses YOLOv8 (You Only Look Once version 8), a state-of-the-art object detection model, trained on thousands of road damage images. The model analyzes images captured via mobile cameras or uploaded by citizens, identifying damage types with high accuracy in milliseconds.',
  },
  {
    question: 'Which damage types are supported?',
    answer:
      'RoadSense AI currently supports detection of potholes, cracks (longitudinal, transverse, and alligator), edge failures, surface defects, and rutting. The model is continuously trained on new data to expand its detection capabilities.',
  },
  {
    question: 'Can municipalities use this platform?',
    answer:
      'Absolutely. RoadSense AI is designed for municipal corporations, highway authorities, civil engineering firms, and government agencies. The platform provides a dedicated dashboard for managing reports, tracking repair progress, and viewing infrastructure analytics.',
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Yes. The frontend is fully responsive and works on all modern smartphones and tablets. Citizens can report road damage directly from their mobile devices, including uploading images and GPS location data.',
  },
  {
    question: 'Is location data secure?',
    answer:
      'Yes. All location data is encrypted in transit and at rest. We follow industry-standard security practices including HTTPS, secure API authentication, and database encryption. Geospatial data is stored in PostgreSQL with PostGIS extension for efficient querying.',
  },
  {
    question: 'Can the AI model be upgraded?',
    answer:
      'Yes. The AI model is designed to be retrained and upgraded as new data becomes available. The modular architecture allows swapping or updating the detection model without affecting other platform components, ensuring the system improves over time.',
  },
  {
    question: 'How accurate is the detection system?',
    answer:
      'Our YOLOv8-based detection model currently achieves over 95% accuracy on standard road damage datasets. Accuracy varies by damage type, lighting conditions, and image quality, but the system is continuously refined through active learning and data augmentation.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-secondary-50 dark:bg-dark-900">
      <Container>
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 dark:text-dark-100">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-secondary-600 dark:text-dark-400 leading-relaxed">
            Everything you need to know about RoadSense AI and how it works.
          </p>
        </motion.div>

        {/* FAQ list */}
        <motion.div
          className="max-w-2xl mx-auto space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3 }}
        >
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-white dark:bg-dark-900 border border-secondary-200 dark:border-dark-700 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-secondary-900 dark:text-dark-100">
                    <HelpCircle
                      size={16}
                      className={`shrink-0 transition-colors duration-200 ${
                        isOpen ? 'text-primary-500' : 'text-secondary-400 dark:text-dark-500'
                      }`}
                      aria-hidden="true"
                    />
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary-100 dark:bg-dark-800 shrink-0"
                  >
                    <ChevronDown
                      size={14}
                      className="text-secondary-500 dark:text-dark-400"
                      aria-hidden="true"
                    />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className="h-px bg-secondary-100 dark:bg-dark-800 mb-3" />
                        <p className="text-sm text-secondary-600 dark:text-dark-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
