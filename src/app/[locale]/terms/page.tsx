import { useTranslations } from 'next-intl'

export default function TermsPage() {
  const t = useTranslations('terms')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-8 text-center">PredIQ.fun Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            These Terms of Use provide the terms and conditions under which you, whether personally or on behalf of an entity ("you" or "your"), 
            are permitted to use, interact with or otherwise access the platform and services provided by PredIQ.fun ("the Company," "we," "us," or "our"). 
            These Terms of Use, together with our Privacy Policy (collectively, the "Terms"), constitute a binding agreement between you and us.
          </p>
          <p className="mb-4">
            These Terms are applicable to all content, functionality, and features available on PredIQ.fun (the "Platform") including prediction markets, 
            trading interfaces, information services, and related blockchain-based smart contract protocols.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
              IMPORTANT NOTICE: BY ACCESSING, USING, OR INTERACTING WITH THE PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS. 
              IF YOU DO NOT AGREE TO ALL TERMS, YOU ARE NOT AUTHORIZED TO USE THE PLATFORM.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Platform Description</h2>
          <p className="mb-4">
            PredIQ.fun is a decentralized prediction market platform that allows users to create, trade, and resolve prediction markets on various topics 
            including politics, sports, cryptocurrency, economics, and current events. The platform operates using blockchain technology and smart contracts.
          </p>
          <p className="mb-4">
            The Platform provides informational content about current events and allows users to engage with prediction markets through self-directed 
            blockchain transactions. We do not operate as a traditional exchange and do not have control over your transactions or funds.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Eligibility and Restrictions</h2>
          
          <h3 className="text-xl font-medium mb-3">Age and Legal Authority</h3>
          <p className="mb-4">
            The Platform is intended only for users who are 18 years of age or older. By using the Platform, you represent that you have the legal 
            authority to enter into these Terms.
          </p>

          <h3 className="text-xl font-medium mb-3">Restricted Jurisdictions</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="font-semibold text-red-800 dark:text-red-200 mb-2">
              TRADING RESTRICTIONS: Use of the Platform for trading is not permitted by persons or entities residing in or citizens of:
            </p>
            <ul className="list-disc pl-6 text-red-700 dark:text-red-300">
              <li>United States of America</li>
              <li>United Kingdom</li>
              <li>Countries subject to comprehensive sanctions (Iran, North Korea, Cuba, Syria)</li>
              <li>Any jurisdiction where prediction market trading is prohibited</li>
            </ul>
            <p className="mt-2 text-red-800 dark:text-red-200">
              Use of VPNs or other tools to circumvent these restrictions is strictly prohibited.
            </p>
          </div>

          <h3 className="text-xl font-medium mb-3">User Representations</h3>
          <p className="mb-4">By using the Platform, you represent and warrant that:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You are not subject to economic sanctions or on any prohibited persons list</li>
            <li>You have sufficient knowledge and experience with blockchain technology and prediction markets</li>
            <li>Your use complies with all applicable laws and regulations</li>
            <li>You understand the financial risks involved in prediction market trading</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Financial Risks and Disclaimers</h2>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
            <p className="font-semibold text-orange-800 dark:text-orange-200 mb-2">RISK WARNING:</p>
            <ul className="list-disc pl-6 text-orange-700 dark:text-orange-300">
              <li>Prediction markets are highly speculative and carry substantial risk of loss</li>
              <li>You may lose the entire amount you invest in any market</li>
              <li>All transactions are irreversible and final</li>
              <li>Market outcomes are resolved by decentralized oracles, not by the Company</li>
              <li>Cryptocurrency values can be highly volatile</li>
            </ul>
          </div>
          <p className="mb-4">
            You acknowledge that you are using the Platform at your own risk and that you should only participate with funds you can afford to lose entirely.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
          <p className="mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Engage in market manipulation, wash trading, or fraudulent activities</li>
            <li>Use automated trading systems or bots without permission</li>
            <li>Circumvent platform security measures or access controls</li>
            <li>Provide false or misleading information</li>
            <li>Interfere with the proper functioning of the Platform</li>
            <li>Use the Platform for money laundering or terrorist financing</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="mb-4">
            The Platform and its content, features, and functionality are owned by the Company and are protected by copyright, trademark, 
            and other intellectual property laws. You are granted a limited, non-exclusive license to use the Platform for its intended purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semiboned mb-4">7. Privacy and Data</h2>
          <p className="mb-4">
            Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
            which is incorporated into these Terms by reference.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <p className="font-semibold mb-2">THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
            <p className="mb-4">
              We disclaim all warranties, whether express or implied, including warranties of merchantability, 
              fitness for a particular purpose, and non-infringement.
            </p>
            <p className="font-semibold mb-2">LIMITATION OF LIABILITY:</p>
            <p>
              To the maximum extent permitted by law, the Company shall not be liable for any indirect, 
              incidental, special, or consequential damages. Our total liability shall not exceed $100.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
          <p className="mb-4">
            You agree to defend, indemnify, and hold harmless the Company from any claims, damages, 
            or expenses arising from your use of the Platform or violation of these Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Dispute Resolution</h2>
          <p className="mb-4">
            These Terms are governed by the laws of [Jurisdiction]. Any disputes will be resolved through binding arbitration, 
            and you waive your right to participate in class action lawsuits.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Platform. 
            Your continued use constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms, please contact us at: <br />
            <a href="mailto:legal@prediq.fun" className="text-primary hover:underline">legal@prediq.fun</a>
          </p>
        </section>

        <div className="border-t border-border pt-8 mt-8">
          <p className="text-sm text-muted-foreground text-center">
            By using PredIQ.fun, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
          </p>
        </div>
      </div>
    </div>
  )
}