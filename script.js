/**
 * 志な乃 (しなの) - スクリプト
 * スライドショー、お問い合わせフォームメール連携、スクロール演出
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. ローディング画面の非表示処理 & ヒーロー演出トリガー
       ========================================================================== */
    window.addEventListener('load', () => {
        const loadingScreen = document.getElementById('loading');
        const heroSection = document.getElementById('home');
        
        if (loadingScreen) {
            // 2.4秒経過後（ロゴアニメーション完了後）に襖を開く
            setTimeout(() => {
                loadingScreen.classList.add('loaded');
                
                // 襖が開くのと同時にヒーローセクションのアニメーションを開始
                if (heroSection) {
                    heroSection.classList.add('hero-animate');
                }
                
                // 襖が開き終わる時間（1.2秒後）にローディング要素を非表示（display: none）化
                setTimeout(() => {
                    loadingScreen.classList.add('loaded-done');
                }, 1200);
            }, 2400);
        } else {
            // 万が一ローディング画面がない場合は即座にヒーロー演出を適用
            if (heroSection) {
                heroSection.classList.add('hero-animate');
            }
        }
    });

    /* ==========================================================================
       2. モバイルナビゲーションの制御 (Hamburger Menu)
       ========================================================================== */
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileNavToggle && mobileNav) {
        // メニュー開閉ボタンクリック時
        mobileNavToggle.addEventListener('click', () => {
            const isOpen = mobileNavToggle.classList.toggle('open');
            mobileNav.classList.toggle('open', isOpen);
            if (mobileNavOverlay) {
                mobileNavOverlay.classList.toggle('open', isOpen);
            }
            
            // 開いている間は背面スクロールを防止
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // 背景オーバーレイクリック時にも閉じる
        if (mobileNavOverlay) {
            mobileNavOverlay.addEventListener('click', () => {
                mobileNavToggle.classList.remove('open');
                mobileNav.classList.remove('open');
                mobileNavOverlay.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        // ナビゲーションリンククリック時にメニューを閉じる
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavToggle.classList.remove('open');
                mobileNav.classList.remove('open');
                if (mobileNavOverlay) {
                    mobileNavOverlay.classList.remove('open');
                }
                document.body.style.overflow = '';
            });
        });
    }

    /* ==========================================================================
       3. 店内スライドショー (4秒毎切替)
       ========================================================================== */
    const slides = document.querySelectorAll('.slideshow .slide');
    const indicators = document.querySelectorAll('.gallery-indicators .indicator');
    let currentSlide = 0;
    let slideshowInterval;

    function showSlide(index) {
        // 範囲外ガード
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        // スライドのフェード切り替え
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // 直線インジケーターのアクティブ表示
        indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        currentSlide = index;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    // スライド自動再生開始（4秒 = 4000ms 間隔）
    function startSlideshow() {
        slideshowInterval = setInterval(nextSlide, 4000);
    }

    // 手動操作時のインターバル初期化
    function resetSlideshow() {
        clearInterval(slideshowInterval);
        startSlideshow();
    }

    // 初期化とイベント紐付け
    if (slides.length > 0) {
        // 初回スタート
        startSlideshow();

        // 各インジケータークリック時の処理
        indicators.forEach((indicator, i) => {
            indicator.addEventListener('click', () => {
                showSlide(i);
                resetSlideshow();
            });
        });
    }

    /* ==========================================================================
       4. スクロール時のフェードイン表示 (Fade-in on Scroll)
       ========================================================================== */
    const fadeElements = document.querySelectorAll('.fade-in');

    function checkFadeIn() {
        const triggerBottom = window.innerHeight * 0.85;

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            // 要素が画面の下部から15%の位置より上に入ったらクラスを付与
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkFadeIn);
    // ロード直後にも一度実行して初期位置で表示すべきものを判定
    setTimeout(checkFadeIn, 600);

    /* ==========================================================================
       5. スクロールに連動したナビゲーションのアクティブ表示
       ========================================================================== */
    const sections = document.querySelectorAll('main > section');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function syncActiveNavigation() {
        let activeSectionId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // 判定位置のオフセットを150px程度設ける
            if (window.scrollY >= sectionTop - 180) {
                activeSectionId = section.getAttribute('id');
            }
        });

        if (activeSectionId) {
            sidebarLinks.forEach(link => {
                const targetHref = link.getAttribute('href');
                if (targetHref === `#${activeSectionId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    window.addEventListener('scroll', syncActiveNavigation);

    /* ==========================================================================
       6. お問い合わせフォーム処理 (mailtoによるメール起動)
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            // デフォルトの送信処理をキャンセル
            event.preventDefault();

            // 入力データの取得
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const age = document.getElementById('form-age').value.trim();
            const message = document.getElementById('form-message').value.trim();

            // 必須入力のバリデーション (ブラウザ標準でもチェックされますがJSでもダブルチェック)
            if (!name || !email || !age || !message) {
                alert('必須項目をすべて入力してください。');
                return;
            }

            // メールの宛先と内容設定
            const mailtoAddress = 'soba.shinano@gmail.com';
            const mailSubject = '【志な乃】ホームページお問い合わせ';
            
            const mailBody = `そば処 志な乃 お問い合わせ窓口 行\n\nホームページより以下のお問い合わせがありました。\n\n==================================\n【お名前】\n${name} 様\n\n【メールアドレス】\n${email}\n\n【ご年齢】\n${age} 歳\n\n【内容】\n${message}\n==================================\n\n※このメールはホームページのフォームより生成されました。\nそのまま送信ボタンを押してください。`;

            // mailto リンクの構築
            const mailtoUrl = `mailto:${mailtoAddress}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

            try {
                // メールクライアントを起動
                window.location.href = mailtoUrl;

                // ユーザーにガイダンスを表示
                alert(
                    'お問い合わせありがとうございます。\n\nメール作成ソフトを起動します。内容を確認の上、そのまま送信を行ってください。\n\n※もしメールソフトが立ち上がらない場合は、お手数ですが下記のメールアドレスへ直接ご連絡ください。\n宛先: ' + mailtoAddress
                );
            } catch (error) {
                console.error('Mailto failed', error);
                alert('メールソフトの起動に失敗しました。宛先: ' + mailtoAddress + ' までメールを直接お送りください。');
            }
        });
    }
});
