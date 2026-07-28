import { Link } from 'react-router-dom'
import { Briefcase, Shield, Zap, Award, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">HELLO WORK</span>
                <span className="text-[10px] text-primary-400 font-medium block -mt-0.5">零工枢纽</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              中国领先的数字化零工经济平台，为企业提供灵活用工解决方案，为劳动者提供有保障的零工机会。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2.5">
              <li><Link to="/jobs" className="text-sm text-gray-400 hover:text-white transition-colors">找零工</Link></li>
              <li><Link to="/post" className="text-sm text-gray-400 hover:text-white transition-colors">发布岗位</Link></li>
              <li><Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">免费注册</Link></li>
              <li><Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">企业登录</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">平台保障</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-primary-400" /> 薪酬担保日结
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-red-400" /> 按单人身保险
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Award className="w-4 h-4 text-yellow-400" /> 信用分级体系
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-accent-400" /> AI法律保障
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>客服热线：400-123-4567</li>
              <li>商务合作：bd@hellowork.cn</li>
              <li>客服邮箱：support@hellowork.cn</li>
              <li>工作时间：7×24小时</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HELLO WORK 零工枢纽. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">用户协议</a>
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">法律声明</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
