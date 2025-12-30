'use client';

import { useState } from 'react';
import { KeywordDropdown } from './KeywordDropdown';

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
}: SentenceBuilderProps) {
  const [selectedPlanet, setSelectedPlanet] = useState('');
  const [selectedBase, setSelectedBase] = useState('');
  const [selectedBase2, setSelectedBase2] = useState('');
  const [selectedThrough, setSelectedThrough] = useState('');
  const [selectedThrough2, setSelectedThrough2] = useState('');
  const [selectedIs, setSelectedIs] = useState('');
  const [selectedSign, setSelectedSign] = useState('');

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
          onChange={setSelectedPlanet}
        />

        <div className={`keyword-row ${hasDualBase ? 'dual-row' : ''}`}>
          <KeywordDropdown
            label="Base"
            signName={baseSign}
            keywords={baseKeywords}
            value={selectedBase}
            onChange={setSelectedBase}
          />
          {hasDualBase && base2Sign && (
            <KeywordDropdown
              label="Base 2"
              signName={base2Sign}
              keywords={base2Keywords}
              value={selectedBase2}
              onChange={setSelectedBase2}
            />
          )}
        </div>

        <div className={`keyword-row ${hasDualBase ? 'dual-row' : ''}`}>
          <KeywordDropdown
            label="Through"
            signName={throughSign}
            keywords={throughKeywords}
            value={selectedThrough}
            onChange={setSelectedThrough}
          />
          {hasDualBase && through2Sign && (
            <KeywordDropdown
              label="Through 2"
              signName={through2Sign}
              keywords={through2Keywords}
              value={selectedThrough2}
              onChange={setSelectedThrough2}
            />
          )}
        </div>

        <KeywordDropdown
          label="House"
          signName={isSign}
          keywords={isSignKeywords}
          value={selectedIs}
          onChange={setSelectedIs}
        />

        <KeywordDropdown
          label="Sign"
          signName={inputSign}
          keywords={inputSignKeywords}
          value={selectedSign}
          onChange={setSelectedSign}
        />
      </div>

      <div className="sentence-output">
        <div className="sentence-label">Your Interpretation:</div>
        <div className="sentence-text">{renderSentence()}</div>
      </div>
    </div>
  );
}
