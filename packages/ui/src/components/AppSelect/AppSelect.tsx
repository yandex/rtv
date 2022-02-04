import Select from 'react-select';
import { KnownApp } from 'rtv-client';

interface Props {
  apps: KnownApp[];
  app?: KnownApp;
  isLoading: boolean;
  onAppIdChange: (id: string | null) => void;
}

const AppSelect: React.FC<Props> = ({ apps, app, isLoading, onAppIdChange }) => {
  return (
    <Select
      placeholder="Select application..."
      isSearchable
      value={app}
      options={apps}
      getOptionLabel={(app) => app.alias}
      getOptionValue={(app) => app.alias}
      isLoading={isLoading}
      onChange={(app) => onAppIdChange(app && app.alias)}
      styles={{
        option: (defaultStyle, { isSelected, isFocused }) => ({
          ...defaultStyle,
          backgroundColor: isSelected
            ? 'var(--accent-orange-10)'
            : isFocused
            ? 'var(--monochrome-snow)'
            : 'transparent',
          color: 'var(--monochrome-charcoal)',
          ':active': {
            backgroundColor: 'var(--accent-orange-25)',
          },
          cursor: 'pointer',
        }),
        control: (defaultStyle, { menuIsOpen }) => ({
          ...defaultStyle,
          borderRadius: 12,
          height: '100%',
          width: 170,
          boxShadow: 'none',
          cursor: 'pointer',
          ':hover': {
            borderColor: menuIsOpen ? 'var(--accent-orange)' : 'var(--accent-orange-50)',
          },
        }),
        menu: (defaultStyle) => ({
          ...defaultStyle,
          minWidth: '100%',
          width: 'auto',
          borderRadius: 'var(--border-radius-medium)',
          border: '1px solid var(--monochrome-alabaster)',
          boxShadow: 'var(--box-shadow-extra-large)',
          overflow: 'hidden',
        }),
        menuList: (defaultStyle) => ({
          ...defaultStyle,
          paddingTop: 8,
          paddingBottom: 8,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        placeholder: (defaultStyle) => ({
          ...defaultStyle,
          whiteSpace: 'nowrap',
        }),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: 'var(--accent-orange)',
          primary25: 'var(--accent-orange-25)',
          primary50: 'var(--accent-orange-50)',
          primary75: 'var(--accent-orange-75)',
        },
      })}
    />
  );
};

export default AppSelect;
