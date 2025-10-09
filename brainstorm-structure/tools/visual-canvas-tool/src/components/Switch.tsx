import React from 'react';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked = false, onChange, id }) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        .switch-wrapper-${switchId} #checkbox-${switchId} {
          display: none;
        }

        .switch-wrapper-${switchId} .toggle {
          position: relative;
          width: 30px;
          height:25px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition-duration: .5s;
        }

        .switch-wrapper-${switchId} .bars {
          width: 100%;
          height: 2px;
          background-color: #7c9885;
          border-radius: 2px;
        }

        .switch-wrapper-${switchId} #bar2-${switchId} {
          transition-duration: .2s;
        }

        .switch-wrapper-${switchId} #bar1-${switchId},
        .switch-wrapper-${switchId} #bar3-${switchId} {
          width: 100%;
        }

        .switch-wrapper-${switchId} #checkbox-${switchId}:checked + .toggle .bars {
          position: absolute;
          transition-duration: .5s;
        }

        .switch-wrapper-${switchId} #checkbox-${switchId}:checked + .toggle #bar2-${switchId} {
          transform: scaleX(0);
          transition-duration: .2s;
        }

        .switch-wrapper-${switchId} #checkbox-${switchId}:checked + .toggle #bar1-${switchId} {
          width: 100%;
          transform: rotate(45deg);
          transition-duration: .5s;
        }

        .switch-wrapper-${switchId} #checkbox-${switchId}:checked + .toggle #bar3-${switchId} {
          width: 100%;
          transform: rotate(-45deg);
          transition-duration: .5s;
        }

        .switch-wrapper-${switchId} #checkbox-${switchId}:checked + .toggle {
          transition-duration: .5s;
          transform: rotate(180deg);
        }
      `}</style>
      <div className={`switch-wrapper-${switchId}`}>
        <div>
          <input
            type="checkbox"
            id={`checkbox-${switchId}`}
            checked={checked}
            onChange={handleChange}
          />
          <label htmlFor={`checkbox-${switchId}`} className="toggle">
            <div className="bars" id={`bar1-${switchId}`} />
            <div className="bars" id={`bar2-${switchId}`} />
            <div className="bars" id={`bar3-${switchId}`} />
          </label>
        </div>
      </div>
    </div>
  );
}

export default Switch;
