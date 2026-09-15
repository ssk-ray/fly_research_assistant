import { ResearchPaper } from '../types';

export const SAMPLE_PURDUE_PAPER: ResearchPaper = {
  id: 'sample-insect-audio-2025',
  title:
    'Audio-Based Classification of Insect Species Using Machine Learning Models: Cicada, Beetle, Termite, and Cricket',
  shortTitle: 'Insect Audio Classification',
  authors: ['Manas V Shetty', 'Yoga Disha Sendhil Kumar'],
  institution: 'Purdue University',
  year: 2025,
  doiOrArxiv: 'arXiv:2502.13893',
  abstract:
    'This project classifies four insect species — Cicada, Beetle, Termite, and Cricket — from audio recordings. ' +
    'The authors extract Mel Frequency Cepstral Coefficients (MFCCs) from each recording and compare several ' +
    'machine learning models (Decision Tree, Random Forest, XGBoost, KNN, and SVM) for classification accuracy, ' +
    'then study how data augmentation (time stretching and pitch shifting) affects performance.',
  totalPages: 13,
  totalChunks: 8,
  sections: [
    { id: 'sec-motivation', title: 'Motivation', page: 1, snippet: 'Early identification of harmful insect species in crops can prevent significant damage...' },
    { id: 'sec-related', title: 'Related Work', page: 2, snippet: 'Acoustic signal analysis has been a core area of focus for species identification...' },
    { id: 'sec-approach', title: 'Approach / Method', page: 3, snippet: 'Three machine learning models are proposed: Random Forest, KNN, and Decision Tree...' },
    { id: 'sec-dataset', title: 'Dataset Description', page: 4, snippet: 'Audio data compiled from ESC-50, Cicada bioacoustic datasets, and ARS termite recordings...' },
    { id: 'sec-features', title: 'Feature Extraction', page: 6, snippet: '40 MFCC features were computed per 1-second audio instance...' },
    { id: 'sec-modeling', title: 'Modeling', page: 7, snippet: 'Decision Tree, Random Forest, and KNN classifiers were trained and evaluated...' },
    { id: 'sec-augmentation', title: 'Audio Data Augmentation', page: 12, snippet: 'Time stretching and pitch shifting were applied to increase dataset diversity...' },
    { id: 'sec-limitations', title: 'Discussion / Limitations', page: 13, snippet: 'Class imbalance and intra-class variability remain key limitations of this study...' }
  ],
  classesCovered: ['Cicada', 'Cricket', 'Termite', 'Bark Beetle'],
  keyMetrics: [
    { label: 'Best Model Accuracy', value: '97%', subtext: 'KNN, pre-augmentation' },
    { label: 'Insect Classes', value: '4', subtext: 'Cicada, Cricket, Termite, Bark Beetle' },
    { label: 'Models Compared', value: '5', subtext: 'DT, RF, XGBoost, KNN, SVM' },
    { label: 'MFCC Features', value: '40', subtext: 'Extracted per 1-second audio instance' }
  ],
  modelComparisons: [
    { model: 'Decision Tree', accuracyPreAug: 0.90, accuracyPostAug: 0.68, notes: 'Sensitive to blurred class boundaries post-augmentation' },
    { model: 'Random Forest', accuracyPreAug: 0.93, accuracyPostAug: 0.79, notes: 'Moderate robustness to augmentation noise' },
    { model: 'XGBoost', accuracyPreAug: 0.92, accuracyPostAug: 0.69, notes: 'Performance dropped sharply in some train/test splits' },
    { model: 'KNN', accuracyPreAug: 0.97, accuracyPostAug: 0.84, notes: 'Most robust model across all conditions tested' },
    { model: 'SVM (RBF)', accuracyPreAug: 0.92, accuracyPostAug: 0.84, notes: 'Tied with KNN for best post-augmentation accuracy' }
  ],
  instanceDistribution: [
    { species: 'Bark Beetle', clip1: 21, clip2: 16, clip3: 21, clip4: 18, clip5: 21, total: 97 },
    { species: 'Cicada', clip1: 8, clip2: 3, clip3: 9, clip4: 9, clip5: 7, total: 36 },
    { species: 'Cricket', clip1: 4, clip2: 5, clip3: 7, clip4: 7, clip5: 7, total: 30 },
    { species: 'Termite', clip1: 6, clip2: 5, clip3: 15, clip4: 6, clip5: 5, total: 37 }
  ],
  chunks: [
    {
      id: 'chunk-1',
      page: 1,
      section: 'Motivation',
      content:
        'Early identification of harmful insect species in crops can prevent significant damage. Termites alone ' +
        'cause an estimated $5 billion in damage in the U.S. each year, while insect pests contribute to up to 40% ' +
        'of global crop losses, resulting in over $220 billion in economic losses annually.',
      charCount: 280,
      tags: ['motivation', 'page-1']
    },
    {
      id: 'chunk-2',
      page: 2,
      section: 'Related Work',
      content:
        'Traditional approaches often use Mel Frequency Cepstral Coefficients (MFCCs) to represent insect sounds. ' +
        'Deep learning techniques such as CNNs and EfficientNet have also shown promise in extracting spectral and ' +
        'temporal features, though traditional ML models remain useful for small-scale, explainable classification.',
      charCount: 300,
      tags: ['related-work', 'page-2']
    },
    {
      id: 'chunk-3',
      page: 3,
      section: 'Proposed Models',
      content:
        'Three machine learning models were employed for classification: Random Forest (robust against overfitting), ' +
        'K-Nearest Neighbors (simple, effective for local pattern capture), and Decision Tree (interpretable, ' +
        'non-parametric, handles complex non-linear relationships in MFCC features).',
      charCount: 290,
      tags: ['method', 'page-3']
    },
    {
      id: 'chunk-4',
      page: 4,
      section: 'Dataset Description',
      content:
        'The Cricket dataset used 5-second ESC-50 recordings. The Cicada dataset contained 335 audio files across ' +
        '32 species (147 Orthoptera + 188 Cicadidae recordings). Termite sounds came from the ARS bioacoustic ' +
        'library, and Bark Beetle recordings used a monoaxial accelerometer at 9 distances from 5-100cm.',
      charCount: 310,
      tags: ['dataset', 'page-4']
    },
    {
      id: 'chunk-5',
      page: 6,
      section: 'Feature Extraction',
      content:
        'For each 1-second audio instance, 40 MFCC features were computed, and the mean and standard deviation of ' +
        'each coefficient were calculated across the time dimension, producing a compact representation of the ' +
        'sound profile for each of the four insect classes.',
      charCount: 270,
      tags: ['features', 'page-6']
    },
    {
      id: 'chunk-6',
      page: 7,
      section: 'Modeling Results',
      content:
        'Using a leave-one-clip-out cross-validation strategy, KNN achieved the highest average accuracy of 0.97 ' +
        'across all conditions. Random Forest (0.93) and XGBoost (0.92) followed closely, while Decision Tree ' +
        'recorded a slightly lower average accuracy of 0.90.',
      charCount: 270,
      tags: ['results', 'page-7']
    },
    {
      id: 'chunk-7',
      page: 12,
      section: 'Audio Data Augmentation',
      content:
        'Time stretching and pitch shifting were applied via the pydub library to simulate diverse environmental ' +
        'conditions. After augmentation, KNN and SVM (RBF) performed best at 0.84 average accuracy, but all models ' +
        'saw reduced accuracy compared to pre-augmentation results, due to overlapping feature space between classes.',
      charCount: 320,
      tags: ['augmentation', 'page-12']
    },
    {
      id: 'chunk-8',
      page: 13,
      section: 'Discussion / Limitations',
      content:
        'Key limitations include potential class imbalance across clips, intra-class variability in insect sounds, ' +
        'and risk of overfitting on small datasets. Future work could explore deep learning architectures (CNNs, ' +
        'RNNs) and additional feature types such as spectral contrast or chroma features.',
      charCount: 290,
      tags: ['limitations', 'page-13']
    }
  ]
};