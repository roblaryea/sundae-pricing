// Persona quiz and matching system component with multi-select support

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { quizQuestions, calculatePersonaMatch } from '../../data/personas';
import { calculateModuleRecommendations, getRecommendedModuleIds } from '../../lib/moduleRecommendationEngine';
import { getIconByEmoji } from '../../lib/iconMap';
import { cn } from '../../utils/cn';
import { useLocale } from '../../contexts/LocaleContext';
import confetti from 'canvas-confetti';

export function PathwaySelector() {
  const { messages } = useLocale();
  const sim = messages.simulator;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showPersona, setShowPersona] = useState(false);
  const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
  const [showMaxToast, setShowMaxToast] = useState(false);
  const { quizAnswers, setQuizAnswer, setPersona, loadFromPersona, setCurrentStep, setModules, setLocations } = useConfiguration();

  const question = quizQuestions[currentQuestion];
  const isMultiSelect = question?.multiSelect;
  const maxSelections = question?.maxSelections;

  // Get current selections for multi-select questions
  const currentSelections = multiSelections[question?.id] || [];

  const completeQuiz = useCallback((allAnswers: Record<string, string>) => {
    // Calculate persona match
    const result = calculatePersonaMatch(allAnswers);
    setPersona(result.persona, result.confidence);
    
    // Calculate module recommendations using the engine
    const locationAnswer = allAnswers.locations || 'small';
    const appetiteAnswer = allAnswers.appetite || 'ready';
    const painSelections = multiSelections.pain || [];
    
    const moduleRec = calculateModuleRecommendations(
      painSelections,
      locationAnswer,
      appetiteAnswer
    );
    
    // Pre-set recommended modules
    const recommendedModuleIds = getRecommendedModuleIds(moduleRec);
    setModules(recommendedModuleIds);
    
    // Set location count from quiz
    const locationOption = quizQuestions[0].options.find(o => o.id === locationAnswer);
    if (typeof locationOption?.value === 'number') {
      setLocations(locationOption.value);
    }
    
    setShowPersona(true);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [result.persona.color, '#ffffff', '#38BDF8']
    });
  }, [multiSelections, setModules, setLocations, setPersona]);

  const handleOptionClick = useCallback((optionId: string) => {
    if (isMultiSelect) {
      // Multi-select behavior
      const currentSel = multiSelections[question.id] || [];
      
      if (currentSel.includes(optionId)) {
        // Deselect
        setMultiSelections({
          ...multiSelections,
          [question.id]: currentSel.filter(id => id !== optionId)
        });
      } else {
        // Check max selections
        if (maxSelections && currentSel.length >= maxSelections) {
          setShowMaxToast(true);
          setTimeout(() => setShowMaxToast(false), 2500);
          return;
        }
        // Select
        setMultiSelections({
          ...multiSelections,
          [question.id]: [...currentSel, optionId]
        });
      }
    } else {
      // Single-select behavior (original)
      setQuizAnswer(question.id, optionId);

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        completeQuiz({ ...quizAnswers, [question.id]: optionId });
      }
    }
  }, [completeQuiz, currentQuestion, isMultiSelect, maxSelections, multiSelections, question, quizAnswers, setQuizAnswer]);

  const handleContinue = useCallback(() => {
    if (isMultiSelect) {
      // Store multi-select answers as comma-separated for persona calculation
      // But also store as array for module engine
      const selections = multiSelections[question.id] || [];
      if (selections.length > 0) {
        setQuizAnswer(question.id, selections[0]); // Store first for persona calc
      }

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        completeQuiz({ ...quizAnswers, [question.id]: selections[0] || '' });
      }
    }
  }, [completeQuiz, currentQuestion, isMultiSelect, multiSelections, question, quizAnswers, setQuizAnswer]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  const handleShowConfig = useCallback(() => {
    if (showPersona) {
      const result = calculatePersonaMatch(quizAnswers);
      loadFromPersona(result.persona);
      setCurrentStep(1);
    }
  }, [loadFromPersona, quizAnswers, setCurrentStep, showPersona]);

  // Persona reveal screen
  if (showPersona) {
    const result = calculatePersonaMatch(quizAnswers);
    const persona = result.persona;
    const PersonaIcon = getIconByEmoji(persona.emoji);
    
    // Get recommended modules from engine
    const locationAnswer = quizAnswers.locations || 'small';
    const appetiteAnswer = quizAnswers.appetite || 'ready';
    const painSelections = multiSelections.pain || [];
    const moduleRec = calculateModuleRecommendations(painSelections, locationAnswer, appetiteAnswer);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-4">
            {/* eslint-disable-next-line react-hooks/static-components */}
            <PersonaIcon className="w-20 h-20 mx-auto" style={{ color: persona.color }} />
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
            {sim.recommendedForYourPriorities}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-sm text-sundae-muted mb-1">{sim.idealLayer}</div>
              <div className="font-semibold">
                {persona.recommendedPath.includes('report') ? sim.resultLayerReport : sim.resultLayerCore}
              </div>
            </div>
            <div>
              <div className="text-sm text-sundae-muted mb-1">{sim.locationRange}</div>
              <div className="font-semibold">
                {persona.locationRange.min}-{persona.locationRange.max} {messages.summary.locationLabel.toLowerCase()}
              </div>
            </div>
            <div>
              <div className="text-sm text-sundae-muted mb-1">{sim.modulesPreselected}</div>
              <div className="font-semibold">
                {moduleRec.recommended.length > 0 
                  ? sim.basedOnYourPriorities.replace('{count}', String(moduleRec.recommended.length))
                  : sim.startWithBasics}
              </div>
            </div>
          </div>
          {moduleRec.recommended.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-sundae-accent font-medium">
                {sim.recommendedForYourPriorities}
              </div>
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleShowConfig}
          className="button-primary inline-flex items-center gap-2"
        >
          {sim.seeCustomStack}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    );
  }

  // Quiz screen
  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Welcome screen for first question */}
      {currentQuestion === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            {sim.welcomeTitle}
            <Sparkles className="w-10 md:w-12 h-10 md:h-12 text-sundae-accent" />
          </h1>
          <p className="text-lg md:text-xl text-sundae-muted">
            {sim.welcomeSubtitle}
          </p>
        </motion.div>
      )}

      {/* Progress dots with step indicator */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="flex justify-center gap-2">
          {quizQuestions.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => index < currentQuestion && setCurrentQuestion(index)}
              disabled={index > currentQuestion}
              aria-label={sim.stepOf.replace('{current}', String(index + 1)).replace('{total}', String(quizQuestions.length))}
              animate={{
                scale: index === currentQuestion ? 1.3 : 1,
                opacity: index <= currentQuestion ? 1 : 0.3
              }}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                index === currentQuestion 
                  ? 'bg-sundae-accent' 
                  : index < currentQuestion 
                    ? 'bg-white cursor-pointer hover:bg-sundae-accent/70' 
                    : 'bg-sundae-muted cursor-not-allowed'
              )}
            />
          ))}
        </div>
        <span className="text-xs text-sundae-muted">
          {sim.currentStepCount.replace('{current}', String(currentQuestion + 1)).replace('{total}', String(quizQuestions.length))}
        </span>
      </div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-sundae-muted mb-1">
            {question.subtitle}
          </p>
        )}
        {question.helperText && (
          <p className="text-sm text-sundae-accent font-medium">
            {question.helperText}
          </p>
        )}
      </motion.div>

      {/* Selection counter for multi-select */}
        {isMultiSelect && maxSelections && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4"
        >
          <span className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
            currentSelections.length >= maxSelections
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-sundae-surface text-sundae-muted'
          )}>
            {sim.selectedCount.replace('{count}', String(currentSelections.length)).replace('{max}', String(maxSelections))}
          </span>
        </motion.div>
      )}

      {/* Max selection toast */}
      <AnimatePresence>
        {showMaxToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500/90 text-white rounded-lg flex items-center gap-2 shadow-lg"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{sim.maxSelections.replace('{max}', String(maxSelections))}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options grid - responsive */}
      <div className={cn(
        'grid gap-3 md:gap-4',
        question.options.length <= 4 
          ? 'grid-cols-1 md:grid-cols-2' 
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}>
        {question.options.map((option, index) => {
          const isSelected = isMultiSelect 
            ? currentSelections.includes(option.id)
            : quizAnswers[question.id] === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => handleOptionClick(option.id)}
              aria-pressed={isSelected}
              aria-label={option.label}
              className={cn(
                'p-4 md:p-5 rounded-xl border-2 transition-all duration-200 text-left group relative',
                isSelected 
                  ? 'bg-gradient-to-br from-sundae-accent/20 to-blue-500/20 border-sundae-accent/60 ring-2 ring-sundae-accent/30'
                  : 'bg-sundae-surface hover:bg-sundae-surface-hover border-white/10 hover:border-white/30'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-sundae-accent rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                {option.emoji && (() => {
                  const IconComponent = getIconByEmoji(option.emoji);
                  return (
                    <IconComponent 
                      className={cn(
                        'w-7 h-7 md:w-8 md:h-8 flex-shrink-0 transition-transform',
                        isSelected ? 'scale-110' : 'group-hover:scale-110'
                      )} 
                    />
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base md:text-lg mb-0.5">
                    {option.label}
                  </div>
                  {/* Value display for locations */}
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
          );
        })}
      </div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex items-center justify-between"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            currentQuestion === 0
              ? 'opacity-0 pointer-events-none'
              : 'bg-sundae-surface hover:bg-sundae-surface-hover border border-white/10'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          {sim.back}
        </button>

        {/* Continue button for multi-select */}
        {isMultiSelect && (
          <button
            onClick={handleContinue}
            disabled={currentSelections.length === 0 && question.id === 'pain'}
            className={cn(
              'button-primary inline-flex items-center gap-2',
              currentSelections.length === 0 && question.id === 'pain' && 'opacity-50 cursor-not-allowed'
            )}
          >
            {sim.continue}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Skip button for optional multi-select (decisions step) */}
        {isMultiSelect && question.id === 'decisions' && currentSelections.length === 0 && (
          <button
            onClick={handleContinue}
            className="text-sm text-sundae-muted hover:text-white transition-colors"
          >
            {sim.skip}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
