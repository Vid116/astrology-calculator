'use client';

import { useState } from 'react';
import { KeywordDropdown } from './KeywordDropdown';

export interface KeywordSelections {
  planet: string;
  base: string;
  base2: string;
  through: string;
  through2: string;
  house: string;
  sign: string;
}

interface SentenceBuilderProps {
  planet: string;
  planetKeywords: string[];
  baseSign: string;
  baseKeywords: string[];
  base2Sign?: string;
  base2Keywords: string[];
  throughSign: string;
  throughKeywords: string[];
  through2Sign?: string;
  through2Keywords: string[];
  isSign: string;
  isSignKeywords: string[];
  inputSign: string;
  inputSignKeywords: string[];
  hasDualBase: boolean;
  // Optional parent sentence for combined view
  parentSentence?: React.ReactNode;
  // Optional controlled mode
  selections?: KeywordSelections;
  onSelectionsChange?: (selections: KeywordSelections) => void;
}

export function SentenceBuilder({
  planet,
  planetKeywords,
  baseSign,
  baseKeywords,
  base2Sign,
  base2Keywords,
  throughSign,
  throughKeywords,
  through2Sign,
  through2Keywords,
  isSign,
  isSignKeywords,
  inputSign,
  inputSignKeywords,
  hasDualBase,
  parentSentence,
  selections,
  onSelectionsChange,
}: SentenceBuilderProps) {
  // Internal state for uncontrolled mode
  const [internalSelections, setInternalSelections] = useState<KeywordSelections>({
    planet: '',
    base: '',
    base2: '',
    through: '',
    through2: '',
    house: '',
    sign: '',
  });

  // Use controlled or internal state
  const isControlled = selections !== undefined && onSelectionsChange !== undefined;
  const currentSelections = isControlled ? selections : internalSelections;

  const updateSelection = (key: keyof KeywordSelections, value: string) => {
    if (isControlled) {
      onSelectionsChange({ ...selections, [key]: value });
    } else {
      setInternalSelections(prev => ({ ...prev, [key]: value }));
    }
  };

  const selectedPlanet = currentSelections.planet;
  const selectedBase = currentSelections.base;
  const selectedBase2 = currentSelections.base2;
  const selectedThrough = currentSelections.through;
  const selectedThrough2 = currentSelections.through2;
  const selectedIs = currentSelections.house;
  const selectedSign = currentSelections.sign;

  const hasAnySelection =
    selectedPlanet || selectedBase || selectedThrough || selectedIs || selectedSign;

  const renderSentence = () => {
    if (!hasAnySelection) {
      return (
        <span className="sentence-placeholder">
          Select keywords above to build your sentence...
        </span>
      );
    }

    const parts: React.ReactNode[] = [];

    parts.push(
      selectedPlanet ? (
        <strong key="planet" className="kw-filled">
          {selectedPlanet}
        </strong>
      ) : (
        <span key="planet" className="kw-empty">
          [Planet]
        </span>
      )
    );

    parts.push(
      <span key="c1" className="kw-connector">
        {' '}
        based on{' '}
      </span>
    );

    if (hasDualBase) {
      parts.push(
        <span key="p1" className="kw-paren">
          (
        </span>
      );
      parts.push(
        selectedBase ? (
          <strong key="base" className="kw-filled">
            {selectedBase}
          </strong>
        ) : (
          <span key="base" className="kw-empty">
            [Base]
          </span>
        )
      );
      parts.push(
        <span key="c2" className="kw-connector">
          {' '}
          and{' '}
        </span>
      );
      parts.push(
        selectedBase2 ? (
          <strong key="base2" className="kw-filled">
            {selectedBase2}
          </strong>
        ) : (
          <span key="base2" className="kw-empty">
            [Base 2]
          </span>
        )
      );
      parts.push(
        <span key="p2" className="kw-paren">
          )
        </span>
      );
    } else {
      parts.push(
        selectedBase ? (
          <strong key="base" className="kw-filled">
            {selectedBase}
          </strong>
        ) : (
          <span key="base" className="kw-empty">
            [Base]
          </span>
        )
      );
    }

    parts.push(
      <span key="c3" className="kw-connector">
        {' '}
        through{' '}
      </span>
    );

    if (hasDualBase) {
      parts.push(
        <span key="p3" className="kw-paren">
          (
        </span>
      );
      parts.push(
        selectedThrough ? (
          <strong key="through" className="kw-filled">
            {selectedThrough}
          </strong>
        ) : (
          <span key="through" className="kw-empty">
            [Through]
          </span>
        )
      );
      parts.push(
        <span key="c4" className="kw-connector">
          {' '}
          and{' '}
        </span>
      );
      parts.push(
        selectedThrough2 ? (
          <strong key="through2" className="kw-filled">
            {selectedThrough2}
          </strong>
        ) : (
          <span key="through2" className="kw-empty">
            [Through 2]
          </span>
        )
      );
      parts.push(
        <span key="p4" className="kw-paren">
          )
        </span>
      );
    } else {
      parts.push(
        selectedThrough ? (
          <strong key="through" className="kw-filled">
            {selectedThrough}
          </strong>
        ) : (
          <span key="through" className="kw-empty">
            [Through]
          </span>
        )
      );
    }

    parts.push(
      <span key="c5" className="kw-connector">
        {' '}
        directed into{' '}
      </span>
    );
    parts.push(
      selectedIs ? (
        <strong key="is" className="kw-filled">
          {selectedIs}
        </strong>
      ) : (
        <span key="is" className="kw-empty">
          [House]
        </span>
      )
    );

    parts.push(
      <span key="c6" className="kw-connector">
        {' '}
        expressed through{' '}
      </span>
    );
    parts.push(
      selectedSign ? (
        <strong key="sign" className="kw-filled">
          {selectedSign}
        </strong>
      ) : (
        <span key="sign" className="kw-empty">
          [Sign]
        </span>
      )
    );

    return parts;
  };

  return (
    <div className="sentence-builder" data-dual-base={hasDualBase}>
      <h4 className="sentence-builder-title">Build Your Interpretation</h4>
      <p className="sentence-builder-desc">
        Select keywords from each component to create a personalized meaning
      </p>

      <div className="keyword-dropdowns">
        <KeywordDropdown
          label="Planet"
          signName={planet}
          keywords={planetKeywords}
          value={selectedPlanet}
          onChange={(val) => updateSelection('planet', val)}
        />

        <div className={`keyword-row ${hasDualBase ? 'dual-row' : ''}`}>
          <KeywordDropdown
            label="Base"
            signName={baseSign}
            keywords={baseKeywords}
            value={selectedBase}
            onChange={(val) => updateSelection('base', val)}
          />
          {hasDualBase && base2Sign && (
            <KeywordDropdown
              label="Base 2"
              signName={base2Sign}
              keywords={base2Keywords}
              value={selectedBase2}
              onChange={(val) => updateSelection('base2', val)}
            />
          )}
        </div>

        <div className={`keyword-row ${hasDualBase ? 'dual-row' : ''}`}>
          <KeywordDropdown
            label="Through"
            signName={throughSign}
            keywords={throughKeywords}
            value={selectedThrough}
            onChange={(val) => updateSelection('through', val)}
          />
          {hasDualBase && through2Sign && (
            <KeywordDropdown
              label="Through 2"
              signName={through2Sign}
              keywords={through2Keywords}
              value={selectedThrough2}
              onChange={(val) => updateSelection('through2', val)}
            />
          )}
        </div>

        <KeywordDropdown
          label="House"
          signName={isSign}
          keywords={isSignKeywords}
          value={selectedIs}
          onChange={(val) => updateSelection('house', val)}
        />

        <KeywordDropdown
          label="Sign"
          signName={inputSign}
          keywords={inputSignKeywords}
          value={selectedSign}
          onChange={(val) => updateSelection('sign', val)}
        />
      </div>

      <div className="sentence-output">
        <div className="sentence-label">Your Interpretation:</div>
        <div className="sentence-text">
          {parentSentence && (
            <>
              <div className="parent-sentence">{parentSentence}</div>
              <span className="sentence-connector">going into</span>
            </>
          )}
          <div className={parentSentence ? 'child-sentence' : ''}>{renderSentence()}</div>
        </div>
      </div>
    </div>
  );
}
