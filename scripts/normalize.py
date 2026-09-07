"""Text repair for broken font-encoding in the NNF QBank PDF exports."""
import re, unicodedata

LIGATURES = {
    'Ɵ':'ti', 'Ō':'ft', 'Ʃ':'tt', 'ƫ':'tti', 'Ư':'ff',
    'ﬀ':'ff', 'ﬁ':'fi', 'ﬂ':'fl', 'ﬃ':'ffi', 'ﬄ':'ffl',
    '':'•', '':'•', '':' ',
}
PUNCT = {'‘':"'", '’':"'", '“':'"', '”':'"',
         '–':'-', '—':'-', '…':'...', ' ':' '}

def repair(s: str) -> str:
    for k, v in LIGATURES.items(): s = s.replace(k, v)
    for k, v in PUNCT.items():     s = s.replace(k, v)
    return s

def clean(s: str) -> str:
    """repair + collapse whitespace (for matching/hashing, not for display)."""
    return re.sub(r'\s+', ' ', repair(s)).strip()

def fold(s: str) -> str:
    """aggressive fold for concept/duplicate matching."""
    s = clean(s).lower()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9 ]', ' ', s).strip()
