import copy from 'copy-to-clipboard';
import { useContext, useRef, useCallback } from 'react';

import { HeaderActionBarProps } from '../components/HeaderActionBar';
import { ScheduleContext, ThemeContext } from '../contexts';
import { softError, ErrorWithFields } from '../log';
import { exportCoursesToCalendar, downloadShadowCalendar } from '../utils/misc';

export type HookResult = Pick<
  HeaderActionBarProps,
  | 'onCopyCrns'
  | 'enableCopyCrns'
  | 'onExportCalendar'
  | 'enableExportCalendar'
  | 'onDownloadCalendar'
  | 'enableDownloadCalendar'
>;

/**
 * Custom hook to prepare a majority of the `<HeaderActionBar>` props.
 * Requires a valid value for `ScheduleContext` and `ThemeContext`.
 */
export default function useHeaderActionBarProps(): HookResult {
  const [{ oscar, pinnedCrns }] = useContext(ScheduleContext);
  const [theme] = useContext(ThemeContext);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(() => {
    try {
      exportCoursesToCalendar(oscar, pinnedCrns);
    } catch (err) {
      softError(
        new ErrorWithFields({
          message: 'exporting courses to calendar failed',
          fields: {
            pinnedCrns,
            term: oscar.term,
          },
        })
      );
    }
  }, [oscar, pinnedCrns]);

  const handleDownload = useCallback(() => {
    const captureElement = captureRef.current;
    if (captureElement == null) return;
    try {
      downloadShadowCalendar(captureElement, theme);
    } catch (err) {
      softError(
        new ErrorWithFields({
          message: 'downloading shadow calendar as PNG failed',
          fields: {
            pinnedCrns,
            theme,
            term: oscar.term,
          },
        })
      );
    }
  }, [captureRef, theme, pinnedCrns, oscar.term]);

  const handleCopyCrns = useCallback(() => {
    try {
      copy(pinnedCrns.join(', '));
    } catch (err) {
      softError(
        new ErrorWithFields({
          message: 'copying CRNs to clipboard failed',
          fields: {
            pinnedCrns,
            term: oscar.term,
          },
        })
      );
    }
  }, [pinnedCrns, oscar.term]);

  return {
    onCopyCrns: handleCopyCrns,
    enableCopyCrns: pinnedCrns.length > 0,
    onExportCalendar: handleExport,
    enableDownloadCalendar: pinnedCrns.length > 0,
    onDownloadCalendar: handleDownload,
    enableExportCalendar: pinnedCrns.length > 0,
  };
}
