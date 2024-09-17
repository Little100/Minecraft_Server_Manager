using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Minecraft_Server_Manager
{
    /// <summary>
    /// MainWindow.xaml 的交互逻辑
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            tab.SelectedIndex = 1;
        }

        private void server_download(object sender, RoutedEventArgs e)
        {
            dtab.SelectedIndex = 1;
        }

        private void mod_download(object sender, RoutedEventArgs e)
        {
            dtab.SelectedIndex = 2;
        }

        private void plugins_download(object sender, RoutedEventArgs e)
        {
            dtab.SelectedIndex = 3;
        }

        private void paper(object sender, RoutedEventArgs e)
        {
            String pageFileName = "Minecraft_Server_Manager.DownloadPages.Paper";
            Type t = Type.GetType(pageFileName);
            Button buttonPaper = this.FindName("Dpaper") as Button;
            if (buttonPaper != null)
            {
                // 隐藏按钮
                buttonPaper.Visibility = System.Windows.Visibility.Hidden;
            }

            if (t != null)
            {
                DownloadPageChange.Content = new Frame()
                {
                    Content = Activator.CreateInstance(t),
                    //页面切换
                };
            }
        }
    }
}
