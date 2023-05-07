import React from 'react';
import styled from '@emotion/styled';
import { CSSTransition } from 'react-transition-group';
import { SettingGroup } from './App';

const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  background-color: white;
  z-index: 1001;
  width: 350px;
  transition: transform 0.3s ease-in-out;
  overflow-y: hidden;
  border-left: 3px solid black;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

interface PopOutSettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingGroup[];
  onModelSettingsChange: (setting: string, newValue: boolean) => void;
}

const PopOutSettingsMenu: React.FC<PopOutSettingsMenuProps> = ({ 
  isOpen,
  onClose,
  settings,
  onModelSettingsChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    onModelSettingsChange(id, event.target.checked);
  };
  return (
    <>
      <CSSTransition in={isOpen} timeout={300} classNames="pop-out-settings-menu" unmountOnExit>
        <MenuContainer>
          <div className="settingsMenuContainer">
            <h1>Settings</h1>
            <hr/>
            {settings.map((settingGroup) => (
              <React.Fragment key={`setting-group-${settingGroup.name}`}>
                <h2>{settingGroup.name}</h2>
                <div>
                  {settingGroup.description}
                </div>
                <div>
                  <table>
                    <tbody>
                      {settingGroup.settings.map((setting) => (
                        <React.Fragment key={`setting-${setting.id}`}>
                          <tr>
                            <td>
                              <h3>{setting.name}</h3>
                            </td>
                            <td  className="settingSlider">
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  id={`${setting.name}`}
                                  checked={setting.value}
                                  onChange={(event) => handleInputChange(event, setting.name)}
                                />
                                <span className="slider round"></span>
                              </label>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <div className="settingsDescription">
                                {setting.description}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </React.Fragment>
            ))}
          </div>
        </MenuContainer>
      </CSSTransition>
      {isOpen && <Overlay onClick={onClose} />}
    </>
  );
};

export default PopOutSettingsMenu;