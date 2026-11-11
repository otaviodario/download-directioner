export class RulesEngine {
  static sanitizeSubfolder(path) {
    if (!path || typeof path !== 'string') return '';
    return path
      .replace(/\\/g, '/')
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/\/+/g, '/');
  }

  static getExtension(filename) {
    if (!filename || typeof filename !== 'string') return '';
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filename.length - 1) return '';
    return filename.substring(lastDot).toLowerCase();
  }

  static matchesCondition(fieldValue, operator, targetValue) {
    if (fieldValue === undefined || fieldValue === null) return false;
    const current = String(fieldValue).trim();
    const target = String(targetValue || '').trim();

    switch (operator) {
      case 'equals':
        return current.toLowerCase() === target.toLowerCase();
      case 'contains':
        return current.toLowerCase().includes(target.toLowerCase());
      case 'starts_with':
        return current.toLowerCase().startsWith(target.toLowerCase());
      case 'ends_with':
        return current.toLowerCase().endsWith(target.toLowerCase());
      case 'regex':
        try {
          const rx = new RegExp(target, 'i');
          return rx.test(current);
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  static evaluateRule(rule, item) {
    if (!rule.enabled) return { matched: false, matchedCriteria: [] };

    const tests = [];
    const matchedCriteria = [];

    // Extension condition
    if (rule.extension && rule.extension.trim() !== '') {
      let ext = rule.extension.trim().toLowerCase();
      if (!ext.startsWith('.')) ext = '.' + ext;
      const fileExt = this.getExtension(item.filename);
      const isExtMatched = fileExt === ext;
      tests.push(isExtMatched);
      if (isExtMatched) matchedCriteria.push(`extension (${ext})`);
    }

    // MIME type condition
    if (rule.mime && rule.mime.trim() !== '') {
      const isMimeMatched = this.matchesCondition(item.mime, rule.mimeOperator || 'contains', rule.mime);
      tests.push(isMimeMatched);
      if (isMimeMatched) matchedCriteria.push(`mime (${rule.mimeOperator || 'contains'} "${rule.mime}")`);
    }

    // Filename pattern condition
    if (rule.filenamePattern && rule.filenamePattern.trim() !== '') {
      const isFilenameMatched = this.matchesCondition(item.filename, rule.filenameOperator || 'contains', rule.filenamePattern);
      tests.push(isFilenameMatched);
      if (isFilenameMatched) matchedCriteria.push(`filename (${rule.filenameOperator || 'contains'} "${rule.filenamePattern}")`);
    }

    // Origin / Domain condition (Flexible domain & referrer matcher)
    if (rule.origin && rule.origin.trim() !== '') {
      let targetOrigin = rule.origin.trim().toLowerCase();

      targetOrigin = targetOrigin.replace(/^https?:\/\//i, '').replace(/#.*$/, '');
      const slashIndex = targetOrigin.indexOf('/');
      const cleanDomain = slashIndex !== -1 ? targetOrigin.substring(0, slashIndex) : targetOrigin;

      const originSources = [
        item.url,
        item.finalUrl,
        item.referrer
      ].filter(Boolean);

      const matchedOrigin = originSources.some(source => {
        const s = source.toLowerCase();
        return s.includes(cleanDomain) || this.matchesCondition(source, rule.originOperator || 'contains', rule.origin);
      });

      tests.push(matchedOrigin);
      if (matchedOrigin) matchedCriteria.push(`origin (${cleanDomain})`);
    }

    if (tests.length === 0) return { matched: false, matchedCriteria: [] };

    const isRuleSatisfied = rule.matchMode === 'any' ? tests.some(Boolean) : tests.every(Boolean);
    return { matched: isRuleSatisfied, matchedCriteria: isRuleSatisfied ? matchedCriteria : [] };
  }

  static determineTarget(rules, item) {
    for (const rule of rules) {
      const evaluation = this.evaluateRule(rule, item);
      if (evaluation.matched) {
        const sanitizedFolder = this.sanitizeSubfolder(rule.destination);
        const originalName = item.filename.replace(/^.*[\\/]/, '');
        const targetPath = sanitizedFolder ? `${sanitizedFolder}/${originalName}` : originalName;
        return { matched: true, rule, targetPath, matchedCriteria: evaluation.matchedCriteria };
      }
    }
    return { matched: false, rule: null, targetPath: item.filename, matchedCriteria: [] };
  }
}