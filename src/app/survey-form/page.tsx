'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Star, Send, Copy, ChevronRight, Camera, Sparkles, Heart, Smile, Clock, MousePointerClick, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { stores } from '@/app/api/line/login/store';
import SnsModal from '@/components/SnsModal'; // SnsModalをインポート

const Page: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SurveyForm />
    </Suspense>
  );
};

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loader"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
};

const SurveyForm: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [hasCopiedText, setHasCopiedText] = useState(false);
  const [showCopyWarning, setShowCopyWarning] = useState(false);
  const [showPreviewContent, setShowPreviewContent] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [photoType, setPhotoType] = useState<string>("");
  const [otherPhotoType, setOtherPhotoType] = useState<string>("");
  const [isEditingOther, setIsEditingOther] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [activeStar, setActiveStar] = useState<number>(-1);
  const [charactersLeft, setCharactersLeft] = useState<number>(1000);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [store, setStore] = useState<string>("");
  const [visitDate, setVisitDate] = useState<string>("");
  const [howFound, setHowFound] = useState<string[]>([]);
  const [importantFactors, setImportantFactors] = useState<string[]>([]);
  const [photoSatisfaction, setPhotoSatisfaction] = useState<string>("");
  const [otherStaffResponse, setOtherStaffResponse] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [generatedFeedback, setGeneratedFeedback] = useState("");
  const [showGeneratedFeedback, setShowGeneratedFeedback] = useState(false);
  const [submitMessageIndex, setSubmitMessageIndex] = useState(0);
  const submitMessages = ["送信中..."];
  const [customerName, setCustomerName] = useState('');

  const ratingRef = useRef<HTMLDivElement>(null);
  const photoTypeRef = useRef<HTMLDivElement>(null);
  const customerNameRef = useRef<HTMLDivElement>(null);
  const visitDateRef = useRef<HTMLDivElement>(null);
  const howFoundRef = useRef<HTMLDivElement>(null);
  const importantFactorsRef = useRef<HTMLDivElement>(null);
  const photoSatisfactionRef = useRef<HTMLDivElement>(null);
  const otherStaffResponseRef = useRef<HTMLDivElement>(null); 
  const feedbackRef = useRef<HTMLDivElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const generateTextIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [otherPhotoTypeDetail, setOtherPhotoTypeDetail] = useState<string>("");
  const [otherHowFoundDetail, setOtherHowFoundDetail] = useState<string>("");
  const [otherImportantFactorDetail, setOtherImportantFactorDetail] = useState<string>("");
  const [showSnsOptions, setShowSnsOptions] = useState<boolean>(false);
  const [selectedSnsOptions, setSelectedSnsOptions] = useState<string[]>([]);
  const [noSnsDetail, setNoSnsDetail] = useState<string>("");

  const snsOptionsFromModal = [
    { label: "Instagram", description: "インスタを見て" },
    { label: "Facebook", description: "フェイスブックを見て" },
    { label: "X / Twitter", description: "ツイッターを見て" },
    { label: "TikTok", description: "ティックトックを見て" },
    { label: "LINE", description: "LINEを見て" },
    { label: "YouTube", description: "YouTubeを見て" },
    { label: "その他SNS", description: "他のSNSを利用", isOtherSns: true }
  ];
  const otherSnsLabelFromModal = "その他SNS";

  const [editingOtherField, setEditingOtherField] = useState<string | null>(null);

  const photoTypes = [
    { 
      id: "adult", 
      label: "成人", 
      icon: "👘", 
      accent: "from-pink-400 to-rose-400", 
      description: "成人の記念撮影" 
    },
    { 
      id: "baby", 
      label: "赤ちゃん", 
      icon: "👶", 
      accent: "from-blue-400 to-cyan-400", 
      description: "お宮参り・ニューボーン" 
    },
    { 
      id: "753", 
      label: "七五三", 
      icon: "🎎", 
      accent: "from-red-400 to-pink-400", 
      description: "七五三の記念撮影" 
    },
    { 
      id: "birthday", 
      label: "お誕生日", 
      icon: "🎂", 
      accent: "from-yellow-400 to-orange-400", 
      description: "お誕生日の記念撮影" 
    },
    { 
      id: "school", 
      label: "入園入学", 
      icon: "🎓", 
      accent: "from-green-400 to-emerald-400", 
      description: "入園・入学の記念撮影" 
    },
    { 
      id: "family", 
      label: "家族写真", 
      icon: "👨‍👩‍👧‍👦", 
      accent: "from-indigo-400 to-blue-400", 
      description: "ご家族の記念撮影" 
    },
    { 
      id: "wedding", 
      label: "婚礼", 
      icon: "👰", 
      accent: "from-purple-400 to-violet-400", 
      description: "ブライダル・前撮り" 
    },
    { 
      id: "portrait", 
      label: "肖像画", 
      icon: "📸", 
      accent: "from-amber-400 to-orange-400", 
      description: "ポートレート撮影" 
    },
    { 
      id: "maternity", 
      label: "マタニティ", 
      icon: "🤰", 
      accent: "from-pink-300 to-purple-300", 
      description: "マタニティフォト撮影" 
    },
    { 
      id: "other", 
      label: "その他", 
      icon: "📝", 
      accent: "from-slate-400 to-gray-400", 
      description: "その他の撮影" 
    }
  ];

  const howFoundOptions = [
    { label: "家族・親戚", icon: "👨‍👩‍👧‍👦", size: "xs", accent: "from-red-400 to-pink-400", description: "ご家族からの紹介" },
    { label: "知人・友人", icon: "👥", size: "sm", accent: "from-pink-400 to-purple-400", description: "お友達からの紹介" },
    { label: "保育園", icon: "🏫", size: "sm", accent: "from-green-400 to-emerald-400", description: "園からの紹介" },
    { label: "SNS", icon: "📱", size: "md", accent: "from-purple-400 to-indigo-400", description: "各種SNSを見て", isSnsOption: true },
    { label: "産院", icon: "👶", size: "xs", accent: "from-rose-400 to-pink-400", description: "院からの紹介" },
    { label: "新聞", icon: "📰", size: "xs", accent: "from-slate-400 to-gray-400", description: "広告をみて" },
    { label: "フリーペーパー", icon: "📰", size: "sm", accent: "from-amber-400 to-orange-400", description: "地域の情報誌" },
    { label: "ネット検索", icon: "🔍", size: "md", accent: "from-blue-400 to-cyan-400", description: "Google・Yahoo!など" },
    { label: "近くにお住まい", icon: "🏠", size: "sm", accent: "from-emerald-400 to-teal-400", description: "看板などを見て" },
    { label: "神田屋鞄", icon: "🎒", size: "sm", accent: "from-lime-400 to-green-400", description: "チケットを利用" },
    { label: "ソウエクスペリエンス", icon: "🎁", size: "sm", accent: "from-teal-400 to-cyan-400", description: "ギフト券を利用" },
    { label: "その他", icon: "📝", size: "sm", accent: "from-gray-400 to-slate-400", description: "上記以外の経路" }
  ];

  const importantFactorsOptions = [
    { label: "スタッフ対応", icon: "👥", size: "sm", accent: "from-blue-400 to-cyan-400", description: "接客サービス" },
    { label: "写真品質", icon: "📸", size: "xs", accent: "from-purple-400 to-violet-400", description: "仕上がりの良さ" },
    { label: "衣装品質", icon: "👘", size: "sm", accent: "from-pink-400 to-rose-400", description: "種類・状態" },
    { label: "美容サービス", icon: "💄", size: "sm", accent: "from-red-400 to-pink-400", description: "着付け・メイク" },
    { label: "価格", icon: "💰", size: "xs", accent: "from-yellow-400 to-amber-400", description: "料金設定" },
    { label: "店舗の雰囲気", icon: "✨", size: "sm", accent: "from-indigo-400 to-blue-400", description: "内装・環境" },
    { label: "周囲の評判", icon: "👍", size: "xs", accent: "from-emerald-400 to-green-400", description: "口コミ" },
    { label: "SNSの評判", icon: "❤️", size: "xs", accent: "from-rose-400 to-pink-400", description: "SNSでの評価" },
    { label: "アクセス", icon: "🚃", size: "xs", accent: "from-cyan-400 to-teal-400", description: "交通の便" },
    { label: "キャンペーン", icon: "🎉", size: "sm", accent: "from-orange-400 to-amber-400", description: "お得な企画" },
    { label: "ホームページ", icon: "💻", size: "xs", accent: "from-slate-400 to-gray-400", description: "サイトの印象" },
    { label: "その他", icon: "📝", size: "xs", accent: "from-gray-400 to-slate-400", description: "上記以外の理由" }
  ];

  const satisfactionOptions = [
    "とても不満",
    "不満",
    "普通",
    "満足",
    "とても満足"
  ];


  const visitDateOptions = [
    { label: '今日', value: 0 },
    { label: '昨日', value: 1 },
    { label: '1ヶ月以内', value: 30, showCalendar: true },
  ];

  useEffect(() => {
    const savedState = localStorage.getItem('overlayState');
    if (savedState) {
      const {
        showOverlay: savedOverlay,
        generatedFeedback: savedFeedback,
        showGeneratedFeedback: savedShowGenerated,
        feedback: savedUserFeedback
      } = JSON.parse(savedState);

      if (savedOverlay) {
        setShowOverlay(true);
        setGeneratedFeedback(savedFeedback || '');
        setShowGeneratedFeedback(savedShowGenerated || false);
        setHasGenerated(!!savedFeedback);
        setFeedback(savedUserFeedback || '');
      }
    }
  }, []);

  useEffect(() => {
    console.log('オーバーレイ状態の変化を保存');
    localStorage.setItem('overlayState', JSON.stringify({
      showOverlay,
      generatedFeedback,
      showGeneratedFeedback,
      feedback
    }));
  }, [showOverlay, generatedFeedback, showGeneratedFeedback, feedback]);

  useEffect(() => {
    console.log('フィードバックやオーバーレイの状態が変化しました。');
    setCharactersLeft(1000 - feedback.length);
    document.body.style.overflow = showOverlay ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [feedback.length, showOverlay]);

  useEffect(() => {
    console.log('送信中の useEffectがトリガーされました。', { isSubmitting });
    if (isSubmitting) {
      const interval = setInterval(() => {
        setSubmitMessageIndex((prevIndex) => (prevIndex + 1) % submitMessages.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isSubmitting, submitMessages]);

  useEffect(() => {
    const checkAuth = async () => {
      const savedState = localStorage.getItem('overlayState');
      const parsedState = savedState ? JSON.parse(savedState) : null;
      
      if (parsedState && parsedState.showOverlay) {
        console.log('オーバーレイ状態を復元します');
        setShowOverlay(true);
        setGeneratedFeedback(parsedState.generatedFeedback || '');
        setShowGeneratedFeedback(parsedState.showGeneratedFeedback || false);
        setHasGenerated(!!parsedState.generatedFeedback);
        setFeedback(parsedState.feedback || '');
        return;
      }
      
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (!data.user) {
          router.push('/');
          return;
        }

        if (data.selectedStore) {
          setStore(data.selectedStore);
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
  }, []);

  const handlePhotoTypeChange = (newPhotoType: string) => {
    if (newPhotoType === "その他") {
      setIsEditingOther(true);
    } else {
      setPhotoType(newPhotoType);
      setOtherPhotoType("");
    }
  };

  const handleOtherPhotoTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherPhotoType(value);
  };

  const handleOtherPhotoTypeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = otherPhotoType.trim();
      
      const matchingOption = photoTypes.find(type => 
        type.label.toLowerCase() === trimmedValue.toLowerCase()
      );
      
      if (matchingOption) {
        setPhotoType(matchingOption.label);
        setOtherPhotoType("");
      } else if (trimmedValue) {
        setPhotoType("その他");
        setOtherPhotoType(trimmedValue);
      }
      setIsEditingOther(false);
    }
  };

  const handleOtherPhotoTypeBlur = () => {
    const trimmedValue = otherPhotoType.trim();
    
    const matchingOption = photoTypes.find(type => 
      type.label.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (matchingOption) {
      setPhotoType(matchingOption.label);
      setOtherPhotoType("");
    } else if (trimmedValue) {
      setPhotoType("その他");
      setOtherPhotoType(trimmedValue);
    }
    setIsEditingOther(false);
  };

  const getPhotoTypeLabel = (type: string) => {
    if (type === "その他" && otherPhotoType) {
      return otherPhotoType;
    }
    return type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldsToValidate = [
      { ref: ratingRef, value: rating, name: "満足度評価" },
      { ref: photoTypeRef, value: photoType, name: "撮影内容" },
      { ref: customerNameRef, value: customerName, name: "お名前" },
      { ref: customerNameRef, value: phoneNumber, name: "電話番号" },
      { ref: visitDateRef, value: visitDate, name: "来店日" },
      { ref: howFoundRef, value: howFound.length, name: "当店を知ったきっかけ" },
      { ref: importantFactorsRef, value: importantFactors.length, name: "当店をお選びいただいた理由" },
      { ref: photoSatisfactionRef, value: photoSatisfaction, name: "撮影について" },
      { ref: otherStaffResponseRef, value: otherStaffResponse, name: "撮影以外について" },
      { ref: feedbackRef, value: feedback.length >= 30, name: "ご感想（30文字以上）" }
    ];

    for (const field of fieldsToValidate) {
      if (!field.value) {
        alert(`${field.name} を入力または選択してください。`);
        field.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsSubmitting(false);
        return;
      }
    }

    if (!user) {
      console.error('ユーザー情報が見つかりません。');
      alert('ログイン情報が見つかりません。再度ログインしてください。');
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);

      const selectedStore = stores.find(s => s.name === store);
      if (!selectedStore) {
        alert('店舗情報を取得できませんでした。再度ログインしてください。');
        setIsSubmitting(false);
        return;
      }

      let actualHowFound = [...howFound];
      
      if (howFound.includes('その他') && otherHowFoundDetail) {
        actualHowFound = actualHowFound.filter(item => item !== 'その他');
        actualHowFound.push(otherHowFoundDetail);
      }

      if (selectedSnsOptions.length > 0) {
        actualHowFound = actualHowFound.filter(item => item !== "SNS");
        
        actualHowFound = [...actualHowFound, ...selectedSnsOptions];
        
        if (selectedSnsOptions.includes("その他SNS") && noSnsDetail) {
          actualHowFound = actualHowFound.filter(item => item !== "その他SNS");
          actualHowFound.push(noSnsDetail);
        }
      }
      
      let actualImportantFactors = [...importantFactors];
      if (importantFactors.includes('その他') && otherImportantFactorDetail) {
        actualImportantFactors = actualImportantFactors.filter(item => item !== 'その他');
        actualImportantFactors.push(otherImportantFactorDetail);
      }

      const data = {
        photoType: otherPhotoType || photoType,
        rating: rating,
        store: selectedStore.name,
        store_id: selectedStore.store_id,
        name: customerName,
        phone: phoneNumber,
        visitDate: visitDate,
        photoSatisfaction: photoSatisfaction,
        otherStaffResponse: otherStaffResponse,
        howFound: actualHowFound,
        importantFactors: actualImportantFactors,
        feedback: feedback,
        line_display_name: user?.displayName
      };

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const lineMessagePayload = {
         userId: user.userId,
         surveyData: data
      };

      await fetch('/api/line/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lineMessagePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '送信中にエラーが発生しました');
      }

      setShowOverlay(true);

    } catch (error: any) {
      console.error('送信エラー:', error);
      alert(error.message || 'アンケートの送信中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIFeedback = async () => {
    if (hasGenerated || isGenerating) return;
    
    setIsGenerating(true);
    setDisplayedText("");
    
    try {
      const currentStore = store;
      if (!currentStore) {
        throw new Error('店舗情報が見つかりません');
      }
      
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          photoType,
          store: currentStore,
          otherStaffResponse,
          howFound,
          importantFactors,
          feedback,
          photoSatisfaction,
          visitDate,
          customerName
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.generatedText) {
        throw new Error('API response does not contain generated text');
      }

      const generatedText = data.generatedText;
      setGeneratedFeedback(generatedText);
      localStorage.setItem('generatedFeedback', generatedText);
      
      if (generateTextIntervalRef.current) {
        clearInterval(generateTextIntervalRef.current);
        generateTextIntervalRef.current = null;
      }
      
      const animateText = (index: number, currentDisplay: string) => {
        if (index < generatedText.length) {
          const char = generatedText.charAt(index);
          const newDisplay = currentDisplay + char;
          setDisplayedText(newDisplay);
          
          let delay = 20 + Math.random() * 20;
          if (['.', '。', '!', '！', '?', '？', ',', '、'].includes(char)) {
            delay += 300;
          }
          setTimeout(() => {
            animateText(index + 1, newDisplay);
          }, delay);
        } else {
          setIsGenerating(false);
          setHasGenerated(true);
        }
      };

      animateText(0, "");
      
    } catch (error) {
      console.error('AI生成エラー:', error);
      setIsGenerating(false);
      setDisplayedText("エラーが発生しました。もう一度お試しください。");
    }
  };

  useEffect(() => {
    return () => {
      if (generateTextIntervalRef.current) {
        clearInterval(generateTextIntervalRef.current);
      }
    };
  }, []);

  const handleGoogleReviewClick = () => {

  };



  const isValid = (() => {
    const basicValidation = 
      rating > 0 && 
      photoType !== "" && 
      feedback.length > 0 && 
      phoneNumber.length > 0 &&
      customerName !== "" &&
      visitDate !== "" &&
      howFound.length > 0 &&
      importantFactors.length > 0 &&
      photoSatisfaction !== "" &&
      otherStaffResponse !== "";

    const isValidDate = (() => {
      if (!visitDate) return false;
      const selectedDate = new Date(visitDate);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      return selectedDate <= today && selectedDate >= thirtyDaysAgo;
    })();

    return basicValidation && isValidDate;
  })();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setter(value);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleVisitDateChange = (newVisitDate: string) => {
    setVisitDate(newVisitDate);
  };

  const handleSnsModalSubmit = (selectedOptions: string[], otherDetail: string) => {
    setSelectedSnsOptions(selectedOptions);
    setNoSnsDetail(otherDetail);
    
    localStorage.setItem('selectedSnsOptions', JSON.stringify(selectedOptions));
    localStorage.setItem('noSnsDetail', otherDetail);
    
    setHowFound(prevHowFound => {
      const nonSnsItems = prevHowFound.filter(item => {
        const option = howFoundOptions.find(opt => opt.label === item);
        return !option || !option.isSnsOption;
      }).filter(item => item !== "SNS");
      
      let newHowFound;
      if (selectedOptions.length > 0 || otherDetail) {
        newHowFound = [...nonSnsItems, "SNS"];
      } else {
        newHowFound = nonSnsItems;
      }
      
      localStorage.setItem('howFound', JSON.stringify(newHowFound));
      return newHowFound;
    });
    
    setShowSnsOptions(false);
  };

  const handleHowFoundChange = (newHowFound: string[]) => {
    setHowFound(newHowFound);
    
    localStorage.setItem('howFound', JSON.stringify(newHowFound));
  };

  const handleImportantFactorsChange = (newImportantFactors: string[]) => {
    setImportantFactors(newImportantFactors);
    localStorage.setItem('importantFactors', JSON.stringify(newImportantFactors));
  };

  const handlePhotoSatisfactionChange = (newPhotoSatisfaction: string) => {
    setPhotoSatisfaction(newPhotoSatisfaction);
  };

  const handleOtherStaffResponseChange = (newOtherStaffResponse: string) => {
    setOtherStaffResponse(newOtherStaffResponse);
  };

  const sectionClass = `space-y-3`;
  const sectionTitleClass = `block font-medium text-lg text-amber-950 mb-2`;
  const requiredClass = `text-red-500 ml-1`;

  const formatJapaneseDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

    return `${year}年${month}月${day}日（${weekday}）にご来店`;
  };

  const isMobile = () => {
    if (typeof window !== 'undefined') {
      return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
    return false;
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (isMobile()) {
        dateInputRef.current.focus();
      } else {
        dateInputRef.current.showPicker();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dateInputRef.current && 
        !dateInputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loader"></div>
          <p className="mt-4 text-gray-600">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-orange-100">
      <header className="bg-gradient-to-br from-amber-500 via-orange-400 to-amber-600 text-orange-50 py-24 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 animate-pulse">
            <Sparkles className="h-6 w-6 text-amber-200/30" />
          </div>
          <div className="absolute bottom-20 right-20 animate-pulse delay-300">
            <Sparkles className="h-8 w-8 text-amber-200/30" />
          </div>
          <div className="absolute top-32 right-32 animate-pulse delay-700">
            <Sparkles className="h-5 w-5 text-amber-200/30" />
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <Camera 
            className="
              absolute right-4 top-4 text-white/10 rotate-12 animate-float
              w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32
            " 
            strokeWidth={1} 
          />
          
          <Camera 
            className="
              absolute left-4 bottom-4 text-white/10 -rotate-12 animate-float-delayed
              w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
            " 
            strokeWidth={1} 
          />
          
          <Camera 
            className="
              hidden lg:block absolute right-1/4 top-1/2 text-white/10 rotate-45 animate-float
              w-16 h-16
            " 
            strokeWidth={1} 
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 space-y-5 md:space-y-8">
          <div className="space-y-4 md:space-y-6">
            <h1 className="font-yujiboku text-4xl md:text-5xl text-white tracking-tight drop-shadow-sm">
              撮影の思い出を
              <br className="md:hidden" />
              聞かせてください
            </h1>

            <p className="font-zen-maru text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              スタッフの励みになっています♪
            </p>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-white/90 text-amber-600 rounded-full px-5 py-2 text-sm font-medium shadow-lg animate-bounce-slow mt-2">
            <Clock className="h-4 w-4" />
            <span className="font-zen-maru">約3分で完了します</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 md:p-8 -mt-8 md:-mt-12 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl border border-orange-900/10 overflow-hidden">
          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div ref={ratingRef} className={sectionClass}>
                <label className="block font-medium text-xl mb-4 text-amber-950 flex items-center gap-2">
                  <span>満足度評価</span><span className={requiredClass}>*</span>
                  {rating > 0 && (
                    <Heart 
                      className={`h-5 w-5 transition-transform duration-300 ${
                        rating === 5 ? "text-red-500 animate-bounce" :
                        rating === 4 ? "text-orange-500 animate-bounce" :
                        "text-gray-500"
                      }`} 
                      fill="currentColor" 
                    />
                  )}
                </label>
                
                <div className="flex gap-4 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setActiveStar(star)}
                      onMouseLeave={() => setActiveStar(-1)}
                      onClick={() => handleRatingChange(star)}
                      className="relative text-3xl transform hover:scale-125 transition-all duration-300"
                    >
                      <Star
                        size={32}
                        className={`transition-all duration-300 ${
                          rating >= star || activeStar >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-amber-950/20"
                        } ${activeStar >= star ? "animate-pulse" : ""}`}
                      />
                      {activeStar === star && (
                        <div className="absolute -top-8 whitespace-nowrap bg-amber-100 text-amber-900 text-xs py-1 px-2 rounded-full transform -translate-x-1/2 left-1/2">
                          {["残念", "まあまあ", "普通", "良い", "最高！"][star-1]}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={photoTypeRef} className={sectionClass}>
                <label className={sectionTitleClass}>
                  撮影内容<span className={requiredClass}>*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
                  {photoTypes.map(({ id, label, icon, accent, description }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePhotoTypeChange(label)}
                      className={`group p-3 md:p-4 rounded-xl font-medium border-2 transition-all duration-500 flex flex-col gap-2 overflow-hidden relative ${
                        (photoType === label && (label !== "その他" || !isEditingOther))
                          ? "bg-amber-950 text-white border-amber-950"
                          : "border-amber-950/10 hover:border-amber-950/30"
                      }`}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${accent}`}></div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl transform group-hover:scale-125 transition-transform duration-500">{icon}</span>
                        {label === "その他" && isEditingOther ? (
                          <input
                            type="text"
                            value={otherPhotoType}
                            onChange={handleOtherPhotoTypeChange}
                            onKeyDown={handleOtherPhotoTypeSubmit}
                            onBlur={handleOtherPhotoTypeBlur}
                            className="relative z-10 bg-transparent border-b border-white/50 focus:border-white outline-none w-full text-black placeholder-gray-600/70 text-center"
                            placeholder="入力してください"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="relative z-10">{getPhotoTypeLabel(label)}</span>
                        )}
                      </div>
                      <div className="text-xs opacity-60 text-center">{description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div ref={customerNameRef} className={sectionClass}>
                <label className={sectionTitleClass}>
                  お名前・電話番号<span className={requiredClass}>*</span>
                </label>
                <p className="text-sm text-amber-950/60 mb-2">
                  ※代者様をご入力ください
                </p>
                <input
                  type="name"
                  value={customerName}
                  onChange={handleInputChange(setCustomerName, 'customerName')}
                  className="w-full p-3 border-2 border-amber-950/10 rounded-lg focus:border-amber-950/30 focus:ring-2 focus:ring-amber-300/50 transition-all duration-300"
                  placeholder="例: 木下 花子"
                  required
                />
              </div>
              <div className={sectionClass}>
                
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[^\d-]/g, '');
                    const formattedValue = sanitizedValue.replace(/-+/g, '-');
                    const finalValue = formattedValue.replace(/^-|-$/g, '');
                    
                    setPhoneNumber(finalValue);
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    const sanitizedValue = pastedText.replace(/[^\d-]/g, '');
                    setPhoneNumber(sanitizedValue);
                  }}
                  className="w-full p-3 border-2 border-amber-950/10 rounded-lg focus:border-amber-950/30 focus:ring-2 focus:ring-amber-300/50 transition-all duration-300"
                  placeholder="例: 09012345678"
                  required
                  maxLength={13}
                />
              </div>

              <div ref={visitDateRef} className={sectionClass}>
                <label className={sectionTitleClass}>
                  いつご来店されましたか？<span className={requiredClass}>*</span>
                </label>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  {visitDateOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (option.showCalendar) {
                          setShowCalendar(true);
                          if (dateInputRef.current) {
                            const event = new MouseEvent('click', {
                              view: window,
                              bubbles: true,
                              cancelable: true,
                            });
                            dateInputRef.current.dispatchEvent(event);
                            dateInputRef.current.focus();
                            
                            setTimeout(() => {
                              dateInputRef.current?.click();
                            }, 100);
                          }
                        } else {
                          const date = new Date();
                          date.setDate(date.getDate() - option.value);
                          const newDate = date.toISOString().split('T')[0];
                          setVisitDate(newDate);
                          setShowCalendar(false);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        option.showCalendar && showCalendar
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                  <div className={`transition-all duration-300 ${
                    showCalendar ? 'opacity-100 max-h-[400px]' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                    <div className="relative flex items-center">
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={visitDate}
                        onChange={(e) => {
                          setVisitDate(e.target.value);
                          setShowCalendar(false);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onFocus={() => setShowCalendar(true)}
                        className="flex-grow p-4 border-2 border-amber-950/10 rounded-xl focus:border-amber-950/30 focus:ring-2 focus:ring-amber-300/50 transition-all duration-300"
                        max={new Date().toISOString().split('T')[0]}
                        min={(() => {
                          const date = new Date();
                          date.setDate(date.getDate() - 30);
                          return date.toISOString().split('T')[0];
                        })()}
                        required
                      />
                      <p className="ml-4 text-sm text-amber-950/60">
                        30日以内を選択
                      </p>
                    </div>
                  </div>

                  {visitDate && (
                    <div className="mt-3 text-base transition-all duration-300">
                      {(() => {
                        const selectedDate = new Date(visitDate);
                        const today = new Date();
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(today.getDate() - 30);

                        if (selectedDate > today) {
                          return (
                            <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-800 rounded-lg bg-white shadow-sm">
                              <Clock className="h-4 w-4 text-red-600" />
                              未来の日付は選択できません
                            </span>
                          );
                        } else if (selectedDate < thirtyDaysAgo) {
                          return (
                            <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-800 rounded-lg bg-white shadow-sm">
                              <Clock className="h-4 w-4 text-red-600" />
                              過去30日以内の日付を選択してください
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-amber-200 text-amber-800 rounded-lg bg-white shadow-sm">
                              <Clock className="h-4 w-4 text-amber-600" />
                              {formatJapaneseDate(visitDate)}
                            </span>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>

                <div ref={howFoundRef} className={sectionClass}>
                  <label className={sectionTitleClass}>
                    当店をどのようにお知りにりましたか？（複数回答OK）<span className={requiredClass}>*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {howFoundOptions.map(({ label, icon, size, description, accent, isSnsOption }) => {
                      const isOther = label === 'その他';
                      const isSelected = isSnsOption 
                        ? howFound.includes("SNS") 
                        : howFound.includes(label);
                      const isEditing = isOther && editingOtherField === 'howFound';

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (isEditing) return;
                            if (isSnsOption) {
                              setShowSnsOptions(true);
                            } else if (isOther) {
                              setEditingOtherField('howFound');
                            } else {
                              const newHowFound = [...howFound];
                              if (newHowFound.includes(label)) {
                                setHowFound(newHowFound.filter(item => item !== label));
                              } else {
                                setHowFound([...newHowFound, label]);
                              }
                            }
                          }}
                          className={`
                            group p-3 md:p-4 rounded-full font-medium border-2 transition-all duration-500 
                            flex items-center gap-3 overflow-hidden relative
                            ${
                              isSelected && !isEditing // 条件を変更: 編集中でない場合のみ選択スタイル適用
                                ? "bg-amber-950 text-white border-amber-950"
                                : "border-amber-950/10 hover:border-amber-950/30"
                            }
                            ${size === 'lg' ? 'min-w-[200px]' : size === 'md' ? 'min-w-[180px]' : 'min-w-[160px]'}
                          `}
                        >
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${accent}`}></div>
                          <span className="text-2xl transform group-hover:scale-125 transition-transform duration-500 z-10">
                            {icon}
                          </span>
                          {isOther && isEditing ? (
                            <input
                              type="text"
                              value={otherHowFoundDetail}
                              onChange={(e) => setOtherHowFoundDetail(e.target.value)}
                              onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (value) {
                                  const matchingOption = howFoundOptions.find(opt => 
                                    opt.label.toLowerCase() === value.toLowerCase()
                                  );
                                  
                                  if (matchingOption) {
                                    const newHowFound = howFound.filter(item => item !== 'その他');
                                    setHowFound([...newHowFound, matchingOption.label]);
                                    setOtherHowFoundDetail('');
                                  } else {
                                    if (!howFound.includes('その他')) {
                                      setHowFound([...howFound, 'その他']);
                                    }
                                    setOtherHowFoundDetail(value);
                                  }
                                } else {
                                  setHowFound(howFound.filter(item => item !== 'その他'));
                                  setOtherHowFoundDetail('');
                                }
                                setEditingOtherField(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = (e.target as HTMLInputElement).value.trim();
                                  if (value) {
                                    const matchingOption = howFoundOptions.find(opt => 
                                      opt.label.toLowerCase() === value.toLowerCase()
                                    );
                                    
                                    if (matchingOption) {
                                      const newHowFound = howFound.filter(item => item !== 'その他');
                                      setHowFound([...newHowFound, matchingOption.label]);
                                      setOtherHowFoundDetail('');
                                    } else {
                                      if (!howFound.includes('その他')) {
                                        setHowFound([...howFound, 'その他']);
                                      }
                                      setOtherHowFoundDetail(value);
                                    }
                                  } else {
                                    setHowFound(howFound.filter(item => item !== 'その他'));
                                    setOtherHowFoundDetail('');
                                  }
                                  setEditingOtherField(null);
                                }
                              }}
                              placeholder="入力してください"
                              className="relative z-10 bg-transparent border-b border-white/50 focus:border-white outline-none w-full text-black placeholder-gray-600/70 text-center"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="flex flex-col items-start z-10">
                              <span className="font-medium text-sm">
                                {isOther && otherHowFoundDetail ? otherHowFoundDetail : label}
                              </span>
                              <span className="text-xs opacity-60">{description}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSnsOptions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 animate-fadeIn">
                      <span className="text-sm font-medium text-amber-800 self-center mr-1">SNS:</span>
                      {selectedSnsOptions.map(sns => (
                        (sns === otherSnsLabelFromModal && noSnsDetail) ? (
                          <div
                            key={noSnsDetail}
                            className="inline-flex items-center gap-1.5 bg-amber-100/80 px-3 py-1.5 rounded-full text-amber-900"
                          >
                            <span className="text-xs font-medium">{noSnsDetail}</span>
                          </div>
                        ) : sns !== otherSnsLabelFromModal ? (
                          <div
                            key={sns}
                            className="inline-flex items-center gap-1.5 bg-amber-100/80 px-3 py-1.5 rounded-full text-amber-900"
                          >
                            <span className="text-xs font-medium">{sns}</span>
                          </div>
                        ) : null
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowSnsOptions(true)}
                        className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full text-amber-900 border border-amber-200/50 transition-colors text-xs"
                      >
                        編集
                      </button>
                    </div>
                  )}

                </div>

                <div ref={importantFactorsRef} className={sectionClass}>
                  <label className={sectionTitleClass}>
                    当店をお選びいただいた理由をお聞かください（複数回答OK）<span className={requiredClass}>*</span>
                  </label>

                  <div className="flex flex-wrap gap-3">
                    {importantFactorsOptions.map(({ label, icon, size, description, accent }) => {
                      const isOther = label === 'その他';
                      const isSelected = importantFactors.includes(label);
                      const isEditing = isOther && editingOtherField === 'importantFactors';

                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            if (isEditing) return;
                            if (isOther) {
                              setEditingOtherField('importantFactors');
                            } else {
                              const newFactors = [...importantFactors];
                              if (newFactors.includes(label)) {
                                setImportantFactors(newFactors.filter(item => item !== label));
                              } else {
                                setImportantFactors([...newFactors, label]);
                              }
                            }
                          }}
                          className={`
                            group p-3 md:p-4 rounded-full font-medium border-2 transition-all duration-500 
                            flex items-center gap-3 overflow-hidden relative
                            ${
                              isSelected && !isEditing // 条件を変更: 編集中でない場合のみ選択スタイル適用
                                ? "bg-amber-950 text-white border-amber-950"
                                : "border-amber-950/10 hover:border-amber-950/30"
                            }
                            ${size === 'lg' ? 'min-w-[200px]' : size === 'md' ? 'min-w-[180px]' : 'min-w-[160px]'}
                          `}
                        >
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${accent}`}></div>
                          <span className="text-2xl transform group-hover:scale-125 transition-transform duration-500 z-10">
                            {icon}
                          </span>
                          {isOther && isEditing ? (
                            <input
                              type="text"
                              value={otherImportantFactorDetail}
                              onChange={(e) => setOtherImportantFactorDetail(e.target.value)}
                              onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (value) {
                                  const matchingOption = importantFactorsOptions.find(opt => 
                                    opt.label.toLowerCase() === value.toLowerCase()
                                  );
                                  
                                  if (matchingOption) {
                                    const newFactors = importantFactors.filter(item => item !== 'その他');
                                    setImportantFactors([...newFactors, matchingOption.label]);
                                    setOtherImportantFactorDetail('');
                                  } else {
                                    if (!importantFactors.includes('その他')) {
                                      setImportantFactors([...importantFactors, 'その他']);
                                    }
                                    setOtherImportantFactorDetail(value);
                                  }
                                } else {
                                  setImportantFactors(importantFactors.filter(item => item !== 'その他'));
                                  setOtherImportantFactorDetail('');
                                }
                                setEditingOtherField(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = (e.target as HTMLInputElement).value.trim();
                                  if (value) {
                                    const matchingOption = importantFactorsOptions.find(opt => 
                                      opt.label.toLowerCase() === value.toLowerCase()
                                    );
                                    
                                    if (matchingOption) {
                                      const newFactors = importantFactors.filter(item => item !== 'その他');
                                      setImportantFactors([...newFactors, matchingOption.label]);
                                      setOtherImportantFactorDetail('');
                                    } else {
                                      if (!importantFactors.includes('その他')) {
                                        setImportantFactors([...importantFactors, 'その他']);
                                      }
                                      setOtherImportantFactorDetail(value);
                                    }
                                  } else {
                                    setImportantFactors(importantFactors.filter(item => item !== 'その他'));
                                    setOtherImportantFactorDetail('');
                                  }
                                  setEditingOtherField(null);
                                }
                              }}
                              placeholder="入力してください"
                              className="relative z-10 bg-transparent border-b border-white/50 focus:border-white outline-none w-full text-black placeholder-gray-600/70 text-center"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="flex flex-col items-start z-10">
                              <span className="font-medium text-sm">
                                {isOther && otherImportantFactorDetail ? otherImportantFactorDetail : label}
                              </span>
                              <span className="text-xs opacity-60">{description}</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {importantFactors.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full text-amber-900">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {importantFactors.length}個選択中
                        </span>
                      </div>
                      {importantFactors.length >= 2 && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-full text-amber-900">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            複数選択されています
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div ref={photoSatisfactionRef} className={sectionClass}>
                  <label className={sectionTitleClass}>
                    お写真はいかがでしたか？<span className={requiredClass}>*</span>
                  </label>
                  
                  <div className="bg-white rounded-xl p-4 border-2 border-amber-950/10">
                    <div className="space-y-3">
                      <div className="h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 transition-all duration-500 ease-out"
                          style={{ 
                            width: photoSatisfaction ? 
                              `${((satisfactionOptions.findIndex(option => option === photoSatisfaction) + 1) / 5) * 100}%` : 
                              '0%' 
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-5 gap-1">
                        {satisfactionOptions.map((option, index) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setPhotoSatisfaction(satisfactionOptions[index]);

                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 hover:bg-amber-50 relative ${
                              photoSatisfaction === satisfactionOptions[index] ? "bg-amber-50" : ""
                            }`}
                          >
                            {photoSatisfaction === satisfactionOptions[index] && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full shadow-sm" />
                            )}
                            
                            <span className={`text-xl transition-all duration-500 ease-out ${
                              index === 4 ? "scale-115" : index === 3 ? "scale-110" : index === 2 ? "scale-105" : index === 1 ? "scale-100" : "scale-95"
                            }`}>
                              {index === 4 ? "😊" : index === 3 ? "🙂" : index === 2 ? "😐" : index === 1 ? "😕" : "😔"}
                            </span>
                            
                            <span className={`text-xs text-center transition-colors duration-500 ease-out ${
                              photoSatisfaction === satisfactionOptions[index]
                                ? "text-amber-950 font-medium" 
                                : index >= 3 
                                  ? "text-amber-950/80"
                                  : "text-amber-950/60"
                            }`}>
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={otherStaffResponseRef} className={sectionClass}>
                  <label className={sectionTitleClass}>
                    スタッフの対応はいかがでしたか？<span className={requiredClass}>*</span>
                  </label>
                  
                  <div className="bg-white rounded-xl p-4 border-2 border-amber-950/10">
                    <div className="space-y-3">
                      <div className="h-1.5 bg-gray-100/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 transition-all duration-500 ease-out"
                          style={{ 
                            width: otherStaffResponse ? 
                              `${((satisfactionOptions.findIndex(option => option === otherStaffResponse) + 1) / 5) * 100}%` : 
                              '0%' 
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-5 gap-1">
                        {satisfactionOptions.map((option, index) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setOtherStaffResponse(satisfactionOptions[index]);

                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 hover:bg-amber-50 relative ${
                              otherStaffResponse === satisfactionOptions[index] ? "bg-amber-50" : ""
                            }`}
                          >
                            {otherStaffResponse === satisfactionOptions[index] && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full shadow-sm" />
                            )}
                            
                            <span className={`text-xl transition-all duration-500 ease-out ${
                              index === 4 ? "scale-115" : index === 3 ? "scale-110" : index === 2 ? "scale-105" : index === 1 ? "scale-100" : "scale-95"
                            }`}>
                              {index === 4 ? "😊" : index === 3 ? "🙂" : index === 2 ? "😐" : index === 1 ? "😕" : "😔"}
                            </span>
                            
                            <span className={`text-xs text-center transition-colors duration-500 ease-out ${
                              otherStaffResponse === satisfactionOptions[index]
                                ? "text-amber-950 font-medium" 
                                : index >= 3 
                                  ? "text-amber-950/80"
                                  : "text-amber-950/60"
                            }`}>
                              {option}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={feedbackRef} className={sectionClass}>
  <label className={sectionTitleClass}>
    ご感想<span className={requiredClass}>*</span>
  </label>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className={`text-sm ${feedback.length < 30 ? 'text-red-500' : 'text-amber-600/60'}`}>
        {feedback.length < 30 
          ? `あと${30 - feedback.length}文字必要です` 
          : `残り${charactersLeft}文字まで`}
      </span>
    </div>
  </div>
  <div className="relative">
    <textarea
      value={feedback}
      onChange={(e) => handleInputChange(setFeedback, 'feedback')(e)}
      maxLength={400}
      minLength={30}
      className={`w-full p-4 border-2 rounded-xl h-48 transition-all duration-300 bg-white/50 backdrop-blur-sm ${
        feedback.length < 30 && feedback.length > 0
          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200/50'
          : 'border-amber-950/10 focus:border-amber-950/30 focus:ring-2 focus:ring-amber-300/50'
      }`}
                      placeholder={`例：
・スタッフの対応
・撮影の雰囲気
・お子様の様子
・ポーズ指導・演出`}
                      required
                    />
                    {feedback.length > 0 && (
                      <div className="absolute right-2 bottom-2 text-amber-600/40 text-sm">
                        <Smile className="h-4 w-4 inline-block mr-1" />
                        ご協力ありがとうございます
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={`w-full py-5 px-8 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                      isValid && !isSubmitting
                        ? 'bg-amber-950 hover:bg-amber-900'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="loader"></div>
                        {submitMessages[submitMessageIndex]}
                      </div>
                    ) : (
                      <>
                        送信する
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <SnsModal
          isOpen={showSnsOptions}
          onClose={() => setShowSnsOptions(false)}
          onSubmit={handleSnsModalSubmit}
          initialSelectedSns={selectedSnsOptions}
          initialOtherSnsDetail={noSnsDetail}
        />

        {showOverlay && (
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="min-h-screen px-4 flex items-center justify-center">
              <div className="fixed inset-0 bg-amber-950" aria-hidden="true"></div>
              <div className="relative w-full max-w-4xl mx-auto my-8">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="text-center space-y-4">
                    <h2 className="font-bold text-3xl md:text-4xl text-white">
                      画面をご提示ください
                    </h2>
                    <p className="text-white/80 text-lg">
                      ご回答ありがとうございました。ただいまスタッフが確認いたします。
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
                    
                    <div className="p-6 md:p-8 border-b border-gray-100">
                      <div className="flex border-b border-gray-200 mb-4">
                        <button
                          type="button"
                          onClick={() => setShowGeneratedFeedback(false)}
                          className={`flex-1 py-3 text-center text-sm font-medium transition-all duration-300 relative ${
                            !showGeneratedFeedback 
                              ? 'text-blue-600 border-b-2 border-blue-600' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          記入内容
                          {!showGeneratedFeedback && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left duration-300"></span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowGeneratedFeedback(true);
                            if (!hasGenerated && !isGenerating) {
                              generateAIFeedback();
                            }
                          }}
                          className={`flex-1 py-3 text-center text-sm font-medium transition-all duration-300 relative ${
                            showGeneratedFeedback 
                              ? 'text-blue-600 border-b-2 border-blue-600' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          AI口コミ案
                          {showGeneratedFeedback && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-right duration-300"></span>
                          )}
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 relative">
                      {showGeneratedFeedback ? (
                        <div className="text-gray-800 whitespace-pre-wrap text-md animate-in fade-in slide-in-from-right-8 duration-500">
                          {isGenerating ? (
                            <>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-blue-600 font-medium animate-pulse">AI口コミを生成中...</span>
                                <div className="loader-small"></div>
                              </div>
                              <div className="min-h-[100px] relative">
                                <p className="relative">
                                  {displayedText}
                                  <span className="inline-block ml-0.5 w-0.5 h-4 bg-blue-500 animate-pulse"></span>
                                </p>
                              </div>
                            </>
                          ) : (
                            <p className="min-h-[100px]">{hasGenerated ? generatedFeedback : "AI口コミ案を生成するには「AI口コミ案」ボタンをクリックしてください。"}</p>
                          )}
                        </div>
                      ) : (
                        <div className="animate-in fade-in slide-in-from-left-8 duration-500">
                          <button
                            onClick={() => setShowPreviewContent(!showPreviewContent)}
                            className="w-full text-left text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-2 mb-3"
                          >
                          
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform duration-300 ${
                                showPreviewContent ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {!showPreviewContent && (
                            <div 
                              className="text-center py-6 text-gray-500 relative cursor-pointer"
                              onClick={() => setShowPreviewContent(true)}
                              aria-label="タップして内容を表示"
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-16 bg-gray-200/30 blur-md rounded-md"></div>
                              </div>
                              <div className="relative flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                  <path d="m22 4-20 16"></path>
                                </svg>
                                <span className="text-xs text-gray-500 mt-2">タップして表示</span>
                              </div>
                            </div>
                          )}

                          <div className={`transition-all duration-300 overflow-hidden ${
                            showPreviewContent 
                              ? "max-h-[500px] opacity-100" 
                              : "max-h-0 opacity-0"
                          }`}>
                            <div 
                              className="cursor-pointer" 
                              onClick={() => setShowPreviewContent(false)}
                              aria-label="タップして内容を非表示"
                            >
                              <p className="text-gray-800 whitespace-pre-wrap text-md">
                                {feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>

<div className="p-6 md:p-8 bg-gray-50">
  <div className="space-y-4">
    <button
      onClick={() => {
        navigator.clipboard.writeText(showGeneratedFeedback ? generatedFeedback : feedback);
        setCopySuccess(true);
        setHasCopiedText(true);
        setShowCopyWarning(false);
        setTimeout(() => setCopySuccess(false), 2000);
      }}
      className={`w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 group relative
        ${showCopyWarning ? 'border-red-300 bg-red-50' : ''}`}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
        <span className="text-blue-600 font-bold text-lg">1</span>
      </div>
      <div className="flex-grow">
        <h4 className="font-medium text-gray-900">
          {showCopyWarning ? '先にコピーしてください！' : '感想をコピー'}
        </h4>
        <p className="text-sm text-gray-600">{copySuccess ? "コピーしました！" : ""}</p>
      </div>
      <MousePointerClick className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </button>

    <div className="space-y-2">
      <a
        href={hasCopiedText ? stores.find(s => s.name === store)?.googleReviewUrl : '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!hasCopiedText) {
            e.preventDefault();
            setShowCopyWarning(true);
            return;
          }
          handleGoogleReviewClick();
        }}
        className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all duration-300 group
          ${hasCopiedText 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-400 cursor-not-allowed'}`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-lg">2</span>
        </div>
        <div className="flex-grow text-center">
          <h4 className="font-medium text-white">Googleレビューを投稿</h4>
        </div>
        <ChevronRight className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" />
      </a>
    </div>
  </div>
</div>

                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
}

export default Page;  