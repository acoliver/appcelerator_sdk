<?php
/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to version 1.0 of the Zend Framework
 * license, that is bundled with this package in the file LICENSE.txt, and
 * is available through the world-wide-web at the following URL:
 * http://framework.zend.com/license/new-bsd. If you did not receive
 * a copy of the Zend Framework license and are unable to obtain it
 * through the world-wide-web, please send a note to license@zend.com
 * so we can mail you a copy immediately.
 *
 * @category   Zend
 * @package    Zend_Controller
 * @subpackage Action_Helper
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @version    $Id: AutoCompleteDojo.php 8693 2008-03-08 04:25:17Z matthew $
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */

/** Zend_Controller_Action_Helper_AutoComplete_Abstract */
require_once 'Zend/Controller/Action/Helper/AutoComplete/Abstract.php';

/**
 * Create and send Dojo-compatible autocompletion lists
 *
 * @uses       Zend_Controller_Action_Helper_AutoComplete_Abstract
 * @category   Zend
 * @package    Zend_Controller
 * @subpackage Action_Helper
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
class Zend_Controller_Action_Helper_AutoCompleteDojo extends Zend_Controller_Action_Helper_AutoComplete_Abstract
{
    /**
     * Validate data for autocompletion
     * 
     * @param  mixed $data 
     * @return bool
     */
    public function validateData($data)
    {
        if (is_array($data) && isset($data['items']) && is_array($data['items'])) {
            return true;
        }

        return false;
    }

    /**
     * Prepare data for autocompletion
     * 
     * @param  mixed $data 
     * @param  bool $keepLayouts 
     * @return string
     */
    public function prepareAutoCompletion($data, $keepLayouts = false)
    {
        $items = array();
        foreach ($data as $key => $value) {
            $items[] = array('label' => $value, 'name' => $value);
        }
        $final = array(
            'identifier' => 'name',
            'items'      => $items,
        );
        return $this->encodeJson($final, $keepLayouts);
    }
}
