// Persona quiz and matching system component

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { quizQuestions, calculatePersonaMatch } from '../../data/personas';
import { getIconByEmoji } from '../../lib/iconMap';
import confetti from 'canvas-confetti';

export function PathwaySelector() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showPersona, setShowPersona] = useState(false);
  const { quizAnswers, setQuizAnswer, setPersona, loadFromPersona, setCurrentStep } = useConfiguration();

  const question = quizQuestions[currentQuestion];

  const handleOptionClick = (optionId: string) => {
    setQuizAnswer(question.id, optionId);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, calculate persona
      const allAnswers = { ...quizAnswers, [question.id]: optionId };
      const result = calculatePersonaMatch(allAnswers);
      setPersona(result.persona, result.confidence);
      setShowPersona(true);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [result.persona.color, '#ffffff', '#38BDF8']
      });
    }
  };

  const handleContinue = () => {
    if (showPersona) {
      const result = calculatePersonaMatch(quizAnswers);
      loadFromPersona(result.persona);
      setCurrentStep(1);
    }
  };

  if (showPersona) {
    const result = calculatePersonaMatch(quizAnswers);
    const persona = result.persona;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-4">
            {(() => {
              const IconComponent = getIconByEmoji(persona.emoji);
              return <IconComponent className="w-20 h-20 mx-auto" style={{ color: persona.color }} />;
            })()}
          </div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-2"
            style={{ color: persona.color }}
          >
            {persona.name}
          </motion.h1>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-sundae-muted mb-8 max-w-2xl mx-auto"
        >
          {persona.description}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8 p-6 bg-sundae-surface rounded-xl border border-white/10"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: persona.color }} />
            Your Recommended Path
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-sm text-sundae-muted mb-1">Ideal Layer</div>
              <div className="font-semibold">
                {persona.recommendedPath.includes('report') ? 'Report' : 'Core'}
              </div>
            </div>
            <div>
              <div className="text-sm text-sundae-muted mb-1">Location Range</div>
              <div className="font-semibold">
                {persona.locationRange.min}-{persona.locationRange.max} locations
              </div>
            </div>
            <div>
              <div className="text-sm text-sundae-muted mb-1">Key Modules</div>
              <div className="font-semibold">
                {persona.modules.length > 0 
                  ? persona.modules.join(', ')
                  : 'Start with basics'}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleContinue}
          className="button-primary inline-flex items-center gap-2"
        >
          See Your Custom Stack
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Welcome screen for first question */}
      {currentQuestion === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            Welcome to Sundae
            <Sparkles className="w-12 h-12 text-sundae-accent" />
          </h1>
          <p className="text-xl text-sundae-muted">
            Let's find your perfect intelligence stack
          </p>
        </motion.div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {quizQuestions.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              scale: index === currentQuestion ? 1.2 : 1,
              opacity: index <= currentQuestion ? 1 : 0.3
            }}
            className={`w-2 h-2 rounded-full ${
              index === currentQuestion 
                ? 'bg-sundae-accent' 
                : index < currentQuestion 
                  ? 'bg-white' 
                  : 'bg-sundae-muted'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-2">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-sundae-muted">
            {question.subtitle}
          </p>
        )}
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            onClick={() => handleOptionClick(option.id)}
            className="p-6 bg-sundae-surface hover:bg-sundae-surface-hover rounded-xl border border-white/10 hover:border-sundae-accent/50 transition-all duration-300 text-left group"
          >
            <div className="flex items-start gap-4">
              {option.emoji && (() => {
                const IconComponent = getIconByEmoji(option.emoji);
                return <IconComponent className="w-8 h-8 group-hover:scale-110 transition-transform flex-shrink-0" />;
              })()}
              <div>
                <div className="font-semibold text-lg mb-1">
                  {option.label}
                </div>
                {/* Add value display for some questions */}
                {question.id === 'locations' && (
                  <div className="text-sm text-sundae-muted">
                    {option.value === 1 && '1 location'}
                    {option.value === 3 && '2-5 locations'}
                    {option.value === 8 && '6-10 locations'}
                    {option.value === 25 && '10+ locations'}
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
