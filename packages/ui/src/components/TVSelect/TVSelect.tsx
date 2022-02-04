import Select from 'react-select';
import { KnownTv } from 'rtv-client';

import MenuOption from './MenuOption/MenuOption';
import Option from './Option/Option';

interface Props {
  tvs: KnownTv[];
  tv?: KnownTv;
  isLoading: boolean;
  onTvIpChange: (ip: string | null) => void;
}

const TVSelect: React.FC<Props> = ({ tvs, tv, isLoading, onTvIpChange }) => {
  return (
    <Select
      placeholder="Select TV..."
      isSearchable
      isLoading={isLoading}
      value={tv}
      options={tvs}
      formatOptionLabel={(knownTv, { context }) =>
        context === 'menu' ? <MenuOption knownTv={knownTv} /> : <Option knownTv={knownTv} />
      }
      getOptionLabel={(tv) => `${tv.alias}, ${tv.ip}`}
      getOptionValue={(tv) => tv.ip}
      onChange={(tv) => onTvIpChange(tv && tv.ip)}
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
          border: 'none',
          borderRadius: 'var(--border-radius-medium)',
          cursor: 'pointer',
          ':hover': {
            boxShadow: menuIsOpen ? '0 0 0 1px var(--accent-orange)' : '0 0 0 1px var(--accent-orange-50)',
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
          paddingTop: 12,
          paddingBottom: 12,
          overflowX: 'hidden',
        }),
        dropdownIndicator: (defaultStyle) => ({
          ...defaultStyle,
          padding: '8px 12px 8px 4px',
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        valueContainer: (defaultStyle) => ({
          ...defaultStyle,
          padding: '8px 0 8px 14px',
        }),
        input: (defaultStyle, { value }) => ({
          ...defaultStyle,
          fontSize: 18,
          fontWeight: 600,
          minWidth: value ? 200 : undefined,
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

export default TVSelect;
